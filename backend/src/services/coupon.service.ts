import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class CouponService {
  static async validateCoupon(code: string, currentOrderAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Coupon code is invalid or deactivated.', 400);
    }

    if (coupon.expiresAt < new Date()) {
      throw new AppError('Coupon code has expired.', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('This coupon code limit has been reached.', 400);
    }

    if (coupon.minOrderAmount && currentOrderAmount < Number(coupon.minOrderAmount)) {
      throw new AppError(
        `Minimum order amount to qualify for this coupon is $${Number(coupon.minOrderAmount).toFixed(2)}.`,
        400
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = currentOrderAmount * (Number(coupon.discountValue) / 100);
      // Apply discount caps if set
      if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    } else {
      // FIXED discount
      discountAmount = Number(coupon.discountValue);
    }

    // Ensure discount doesn't exceed total amount
    if (discountAmount > currentOrderAmount) {
      discountAmount = currentOrderAmount;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
    };
  }

  static async createCoupon(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount?: number | null;
    maxDiscountAmount?: number | null;
    expiresAt: Date;
    isActive?: boolean;
    usageLimit?: number | null;
  }) {
    const code = data.code.toUpperCase().trim();

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new AppError('Coupon code already registered.', 400);
    }

    return await prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
        usageLimit: data.usageLimit,
      },
    });
  }

  static async getCoupons() {
    return await prisma.coupon.findMany({
      orderBy: { expiresAt: 'asc' },
    });
  }
}
