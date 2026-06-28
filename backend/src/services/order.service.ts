import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { CartService } from './cart.service';
import { CouponService } from './coupon.service';
import { OrderStatus, PaymentGateway, PaymentStatus, GemstoneStatus } from '../types/prisma.mock';

export interface OrderCreateInput {
  shippingAddressId: string;
  billingAddressId: string;
  paymentGateway: PaymentGateway;
  couponCode?: string | null;
  carrier?: string | null;
}

export class OrderService {
  private static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BYD-${year}-${randomStr}`;
  }

  static async createOrder(userId: string, inputData: OrderCreateInput) {
    const { shippingAddressId, billingAddressId, paymentGateway, couponCode, carrier } = inputData;

    // Fetch user cart
    const cart = await CartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty. Add items to cart before checking out.', 400);
    }

    // Retrieve addresses
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findFirst({ where: { id: shippingAddressId, userId } }),
      prisma.address.findFirst({ where: { id: billingAddressId, userId } }),
    ]);

    if (!shippingAddress || !billingAddress) {
      throw new AppError('Shipping or billing address not found.', 404);
    }

    return await prisma.$transaction(async (tx) => {
      let subtotal = cart.subtotal;
      let discountAmount = 0;
      let couponId: string | undefined;

      // Validate Coupon if provided
      if (couponCode) {
        const validation = await CouponService.validateCoupon(couponCode, subtotal);
        discountAmount = validation.discountAmount;
        couponId = validation.couponId;
      }

      // Compute shipping based on selected carrier
      const selectedCarrier = carrier || "FedEx Priority Insured";
      let shippingAmount = 50;
      if (selectedCarrier === "Brink's Armored Valuables Delivery") {
        shippingAmount = 150;
      } else {
        // FedEx Priority Insured (complimentary above $500)
        shippingAmount = (subtotal - discountAmount) > 500 ? 0 : 50;
      }

      // Compute totals
      const taxRate = 0.0825; // 8.25% Luxury Tax rate
      const taxAmount = (subtotal - discountAmount) * taxRate;
      const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

      // Lock and check stock for variants and loose gemstones
      for (const item of cart.items) {
        // Lock gemstone
        if (item.gemstone) {
          const gemstone = await tx.gemstone.findUnique({
            where: { id: item.gemstone.id },
          });

          if (!gemstone || gemstone.status !== GemstoneStatus.AVAILABLE) {
            throw new AppError(`Loose diamond ${item.gemstone.certificateNumber || ''} is no longer available.`, 400);
          }

          // Mark as reserved during checkout
          await tx.gemstone.update({
            where: { id: item.gemstone.id },
            data: { status: GemstoneStatus.RESERVED },
          });
        }
      }

      // Increment coupon usage count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create primary order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING_PAYMENT,
          totalAmount,
          taxAmount,
          shippingAmount,
          shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
          billingAddress: JSON.parse(JSON.stringify(billingAddress)),
          carrier: selectedCarrier,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
              selectedMetal: item.selectedMetal,
              selectedSize: item.selectedSize,
              customEngraving: item.customEngraving,
              selectedGemstoneId: item.gemstone?.id,
            })),
          },
        },
      });

      // Clear Cart items
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return order;
    });
  }

  static async getOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } },
            selectedGemstone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderDetails(orderId: string, userId: string, userRole: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            selectedGemstone: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    // Role-based verification checks
    if (order.userId !== userId && userRole === 'CUSTOMER') {
      throw new AppError('You are not authorized to view this order details.', 403);
    }

    return order;
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Order record not found.', 404);
    }

    return await prisma.$transaction(async (tx) => {
      // If order is cancelled, release gemstones back to catalog
      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.selectedGemstoneId) {
            await tx.gemstone.update({
              where: { id: item.selectedGemstoneId },
              data: { status: GemstoneStatus.AVAILABLE },
            });
          }
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(trackingNumber && { trackingNumber }),
          ...(carrier && { carrier }),
        },
      });
    });
  }
}
