import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { OrderStatus, PaymentGateway, PaymentStatus, GemstoneStatus } from '../types/prisma.mock';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'stripe_secret_mock', {
  apiVersion: '2024-04-10' as any,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock',
});

export class PaymentService {
  static async createPaymentIntent(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found.', 404);
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new AppError('This order has already been processed or cancelled.', 400);
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    let clientSecret = '';
    let gatewayOrderId = '';

    if (order.payment) {
      // Return existing payment intent variables if already created
      if (order.payment.gateway === PaymentGateway.STRIPE) {
        clientSecret = (order.payment.gatewayResponse as any)?.client_secret || '';
      } else if (order.payment.gateway === PaymentGateway.RAZORPAY) {
        gatewayOrderId = order.payment.transactionId;
      }
      return { clientSecret, gatewayOrderId, paymentId: order.payment.id };
    }

    if (order.totalAmount.gt(15000) && order.totalAmount.eq(0)) {
      // Wire transfer placeholder fallback standard
      throw new AppError('High-value transactions exceeding limits require manual wire approval. Contact concierge.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // Initialize Stripe Intent
      const stripeIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { orderId: order.id, userId },
      });

      // Initialize Razorpay Order (Fallback / Multi-Gateway checkout)
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInCents,
        currency: 'USD', // Convert to INR or currency based on locale in production
        receipt: order.orderNumber,
        notes: { orderId: order.id, userId },
      });

      // Record transaction
      const paymentRecord = await tx.payment.create({
        data: {
          orderId: order.id,
          gateway: PaymentGateway.STRIPE, // Defaults to primary Stripe gateway
          transactionId: stripeIntent.id,
          amount: order.totalAmount,
          status: PaymentStatus.PENDING,
          gatewayResponse: JSON.parse(JSON.stringify(stripeIntent)),
        },
      });

      return {
        paymentId: paymentRecord.id,
        stripe: {
          clientSecret: stripeIntent.client_secret,
          intentId: stripeIntent.id,
        },
        razorpay: {
          orderId: razorpayOrder.id,
        },
      };
    });
  }

  static async confirmOrderPayment(transactionId: string, gateway: PaymentGateway, rawPayload: any, orderId?: string) {
    return await prisma.$transaction(async (tx) => {
      let payment = await tx.payment.findUnique({
        where: { transactionId },
        include: { order: { include: { items: true } } },
      });

      if (!payment && orderId) {
        payment = await tx.payment.findFirst({
          where: { orderId },
          include: { order: { include: { items: true } } },
        });
      }

      if (!payment) {
        throw new AppError('Associated payment record was not found.', 404);
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return payment;
      }

      // 1. Update Payment record to Success and set fields
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          gateway: gateway,
          transactionId: gateway === PaymentGateway.RAZORPAY ? (rawPayload.razorpayPaymentId || transactionId) : transactionId,
          status: PaymentStatus.SUCCESS,
          gatewayResponse: JSON.parse(JSON.stringify(rawPayload)),
        },
      });

      // 2. Update Order status to PAID / PROCESSING
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID },
      });

      // 3. Mark all attached custom loose gemstones as SOLD
      for (const item of payment.order.items) {
        if (item.selectedGemstoneId) {
          await tx.gemstone.update({
            where: { id: item.selectedGemstoneId },
            data: { status: GemstoneStatus.SOLD },
          });
        }
      }

      // 4. Log successful checkout event
      await tx.auditLog.create({
        data: {
          userId: payment.order.userId,
          action: 'ORDER_PAYMENT_VERIFIED',
          details: JSON.stringify({
            orderId: payment.orderId,
            orderNumber: payment.order.orderNumber,
            gateway,
            transactionId,
          }),
        },
      });

      return updatedPayment;
    });
  }

  static async verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generated_signature === signature;
  }
}
