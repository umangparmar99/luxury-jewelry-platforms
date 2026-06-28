import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { CouponService } from '../services/coupon.service';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import { OrderStatus, PaymentGateway, PaymentStatus } from '../types/prisma.mock';

export class CheckoutController {
  // --- CART ---
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cart = await CartService.getCart(userId);
      return ApiResponse.success(res, 'Shopping cart loaded.', cart);
    } catch (error) {
      next(error);
    }
  }

  static async addItemToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cartItem = await CartService.addItemToCart(userId, req.body);
      return ApiResponse.success(res, 'Item added to cart.', cartItem, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCartItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const { quantity } = req.body;
      if (quantity === undefined) {
        throw new AppError('Quantity parameter is required.', 400);
      }

      const updated = await CartService.updateCartItem(userId, itemId, quantity);
      return ApiResponse.success(res, 'Cart item quantity updated.', updated);
    } catch (error) {
      next(error);
    }
  }

  static async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const response = await CartService.removeCartItem(userId, itemId);
      return ApiResponse.success(res, 'Item removed from cart.', response);
    } catch (error) {
      next(error);
    }
  }

  // --- WISHLIST ---
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wishlist = await WishlistService.getWishlist(userId);
      return ApiResponse.success(res, 'Wishlist loaded.', wishlist);
    } catch (error) {
      next(error);
    }
  }

  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wishlistItem = await WishlistService.addToWishlist(userId, req.body);
      return ApiResponse.success(res, 'Item added to wishlist.', wishlistItem, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const response = await WishlistService.removeFromWishlist(userId, itemId);
      return ApiResponse.success(res, 'Item removed from wishlist.', response);
    } catch (error) {
      next(error);
    }
  }

  // --- COUPONS ---
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, amount } = req.query;
      if (!code || !amount) {
        throw new AppError('Coupon code and current order amount are required.', 400);
      }

      const result = await CouponService.validateCoupon(String(code), Number(amount));
      return ApiResponse.success(res, 'Coupon is valid.', result);
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      return ApiResponse.success(res, 'Coupon created.', coupon, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await CouponService.getCoupons();
      return ApiResponse.success(res, 'Coupons list retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  // --- ORDERS ---
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const order = await OrderService.createOrder(userId, req.body);
      return ApiResponse.success(res, 'Order created. Please proceed to payment.', order, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listPersonalOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orders = await OrderService.getOrders(userId);
      return ApiResponse.success(res, 'Orders list retrieved.', orders);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { id } = req.params;
      const order = await OrderService.getOrderDetails(id, userId, userRole);
      return ApiResponse.success(res, 'Order details retrieved.', order);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, carrier } = req.body;
      if (!status) {
        throw new AppError('Status parameter is required.', 400);
      }

      const updated = await OrderService.updateOrderStatus(id, status, trackingNumber, carrier);
      return ApiResponse.success(res, `Order status set to ${status}.`, updated);
    } catch (error) {
      next(error);
    }
  }

  static async listAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'All orders retrieved.', orders);
    } catch (error) {
      next(error);
    }
  }

  // --- PAYMENTS ---
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { orderId } = req.body;
      if (!orderId) {
        throw new AppError('Order ID is required.', 400);
      }

      const intent = await PaymentService.createPaymentIntent(orderId, userId);
      return ApiResponse.success(res, 'Payment transaction intent established.', intent);
    } catch (error) {
      next(error);
    }
  }

  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpayOrderId, razorpayPaymentId, signature, orderId } = req.body;
      if (!razorpayOrderId || !razorpayPaymentId || !signature) {
        throw new AppError('Missing signature parameters.', 400);
      }

      const isValid = await PaymentService.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature);
      if (!isValid) {
        throw new AppError('Payment verification signature check failed.', 400);
      }

      // Complete checkout logic
      const updated = await PaymentService.confirmOrderPayment(razorpayOrderId, PaymentGateway.RAZORPAY, req.body, orderId);
      return ApiResponse.success(res, 'Razorpay payment verified successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  static async mockPaymentSuccess(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { orderId, gateway } = req.body;
      if (!orderId) {
        throw new AppError('Order ID is required.', 400);
      }

      const payment = await prisma.payment.findFirst({
        where: { orderId, order: { userId } },
      });

      if (!payment) {
        throw new AppError('Payment record not found.', 404);
      }

      const targetGateway = (gateway || payment.gateway) as PaymentGateway;
      const updated = await PaymentService.confirmOrderPayment(
        payment.transactionId,
        targetGateway,
        { mock: true, timestamp: new Date().toISOString() },
        orderId
      );

      return ApiResponse.success(res, 'Mock payment completed successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  // Stripe Signature raw payload webhook
  static async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Stub implementation: verification is done inside routes endpoint via raw buffers parsing.
      const stripeSignature = req.headers['stripe-signature'];
      if (!stripeSignature) {
        throw new AppError('Stripe signature header missing.', 400);
      }

      // Retrieve events
      const event = req.body; // In routes, we setup buffer checks
      if (event.type === 'payment_intent.succeeded') {
        const intentId = event.data.object.id;
        await PaymentService.confirmOrderPayment(intentId, PaymentGateway.STRIPE, event);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // --- REVIEWS ---
  static async listPersonalReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            select: { name: true, sku: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Personal reviews list loaded.', reviews);
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;
      const { rating, comment } = req.body;

      // Check if user has purchased the item
      const purchased = await prisma.order.findFirst({
        where: {
          userId,
          status: OrderStatus.DELIVERED,
          items: { some: { productId } },
        },
      });

      const isVerifiedPurchase = !!purchased;

      const review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          comment,
          isVerifiedPurchase,
        },
      });

      // Recalculate average rating of the product
      const aggregations = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      });

      await prisma.product.update({
        where: { id: productId },
        data: { rating: aggregations._avg.rating || 0.0 },
      });

      return ApiResponse.success(res, 'Review added successfully.', review, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const totalRevenueResult = await prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true }
      });
      const totalRevenue = Number(totalRevenueResult._sum.amount || 0);

      const totalOrders = await prisma.order.count();
      const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
      const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group revenue by category
      const orderItems = await prisma.orderItem.findMany({
        where: { order: { status: 'PAID' } },
        include: {
          product: { include: { category: true } }
        }
      });

      const categoryRevenueMap: Record<string, number> = {};
      orderItems.forEach(item => {
        const catName = item.product.category.name;
        const revenue = Number(item.price) * item.quantity;
        categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + revenue;
      });

      const salesByCategory = Object.keys(categoryRevenueMap).map(name => ({
        name,
        value: categoryRevenueMap[name]
      }));

      // Sales over time (monthly trends)
      const recentOrders = await prisma.order.findMany({
        where: { status: 'PAID' },
        orderBy: { createdAt: 'asc' }
      });

      const monthlySalesMap: Record<string, number> = {};
      recentOrders.forEach(order => {
        const month = order.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlySalesMap[month] = (monthlySalesMap[month] || 0) + Number(order.totalAmount);
      });

      const monthlyTrends = Object.keys(monthlySalesMap).map(month => ({
        month,
        revenue: monthlySalesMap[month]
      }));

      // Low stock warnings
      const lowStockVariants = await prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        include: { product: true }
      });

      const lowStockCount = lowStockVariants.length;

      return ApiResponse.success(res, 'Admin analytics loaded.', {
        totalRevenue,
        totalOrders,
        totalCustomers,
        aov,
        salesByCategory,
        monthlyTrends,
        lowStockCount
      });
    } catch (error) {
      next(error);
    }
  }
}
