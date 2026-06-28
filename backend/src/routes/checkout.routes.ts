import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  cartItemSchema,
  wishlistSchema,
  couponSchema,
  orderCreateSchema,
  reviewSchema,
} from '../models/request-schemas';
import Stripe from 'stripe';
import { PaymentGateway } from '../types/prisma.mock';
import { PaymentService } from '../services/payment.service';

const router = Router();

// --- PUBLIC WEBHOOK ROUTES (NO AUTH, RAW PARSING REQUIRED) ---
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'stripe_secret_mock', {
  apiVersion: '2024-04-10' as any,
});

router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

      if (!sig || !endpointSecret) {
        res.status(400).send('Webhook secret or signature missing.');
        return;
      }

      const event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      if (event.type === 'payment_intent.succeeded') {
        const intentId = (event.data.object as any).id;
        await PaymentService.confirmOrderPayment(intentId, PaymentGateway.STRIPE, event);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Stripe webhook failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// --- PROTECTED CHECKOUT & ECOMMERCE FLOWS ---
router.use(protect);

// Cart
router.get('/cart', CheckoutController.getCart);
router.post('/cart/items', validate(cartItemSchema), CheckoutController.addItemToCart);
router.patch('/cart/items/:itemId', CheckoutController.updateCartItemQuantity);
router.delete('/cart/items/:itemId', CheckoutController.removeCartItem);

// Wishlist
router.get('/wishlist', CheckoutController.getWishlist);
router.post('/wishlist/items', validate(wishlistSchema), CheckoutController.addToWishlist);
router.delete('/wishlist/items/:itemId', CheckoutController.removeFromWishlist);

// Coupons
router.get('/coupons/validate', CheckoutController.validateCoupon);

// Orders
router.get('/orders', CheckoutController.listPersonalOrders);
router.post('/orders', validate(orderCreateSchema), CheckoutController.createOrder);
router.get('/orders/:id', CheckoutController.getOrderDetails);

// Payments
router.post('/payments/create-intent', CheckoutController.createPaymentIntent);
router.post('/payments/verify-razorpay', CheckoutController.verifyRazorpayPayment);
router.post('/payments/mock-success', CheckoutController.mockPaymentSuccess);

// Reviews
router.get('/reviews/personal', CheckoutController.listPersonalReviews);
router.post('/products/:productId/reviews', validate(reviewSchema), CheckoutController.createReview);

// --- ADMIN / OPERATIONS SCOPED ONLY ---
router.use(restrictTo('ADMIN', 'ORDER_MANAGER'));

// Coupon overrides
router.get('/coupons', CheckoutController.listCoupons);
router.post('/coupons', validate(couponSchema), CheckoutController.createCoupon);

// Order overrides
router.get('/admin/orders', CheckoutController.listAllOrders);
router.patch('/admin/orders/:id', CheckoutController.updateOrderStatus);
router.get('/admin/analytics', CheckoutController.getAdminAnalytics);

export default router;
