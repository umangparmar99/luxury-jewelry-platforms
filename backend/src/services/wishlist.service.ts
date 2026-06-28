import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { MetalType } from '../types/prisma.mock';

export interface WishlistItemInput {
  productId: string;
  selectedMetal?: MetalType | null;
  selectedSize?: number | null;
  selectedGemstoneId?: string | null;
}

export class WishlistService {
  static async getWishlist(userId: string) {
    return await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            basePrice: true,
            status: true,
            variants: { take: 1, select: { imageUrls: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addToWishlist(userId: string, data: WishlistItemInput) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new AppError('Product not found or currently unavailable.', 404);
    }

    // Deduplicate exact item configuration in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId: data.productId,
        selectedMetal: data.selectedMetal,
        selectedSize: data.selectedSize,
        selectedGemstoneId: data.selectedGemstoneId,
      },
    });

    if (existing) {
      return existing;
    }

    return await prisma.wishlistItem.create({
      data: {
        userId,
        productId: data.productId,
        selectedMetal: data.selectedMetal,
        selectedSize: data.selectedSize,
        selectedGemstoneId: data.selectedGemstoneId,
      },
    });
  }

  static async removeFromWishlist(userId: string, wishlistItemId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!item || item.userId !== userId) {
      throw new AppError('Wishlist item not found.', 404);
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });

    return { id: wishlistItemId };
  }
}
