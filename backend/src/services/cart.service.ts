import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { MetalType } from '../types/prisma.mock';

export interface AddToCartInput {
  productId: string;
  quantity: number;
  selectedMetal?: MetalType | null;
  selectedSize?: number | null;
  customEngraving?: string | null;
  selectedGemstoneId?: string | null;
}

export class CartService {
  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                metalConfigs: true,
              },
            },
            selectedGemstone: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  metalConfigs: true,
                },
              },
              selectedGemstone: true,
            },
          },
        },
      });
    }

    // Dynamic Price Calculators
    let subtotal = 0;
    const itemsWithPricing = cart.items.map((item) => {
      let itemPrice = Number(item.product.basePrice);

      // 1. Metal Pricing Override
      if (item.selectedMetal) {
        const metalConfig = item.product.metalConfigs.find(
          (cfg) => cfg.metalType === item.selectedMetal
        );
        if (metalConfig) {
          itemPrice += Number(metalConfig.priceAdjustment);
        }
      }

      // 2. Loose Diamond / Gemstone Attachment
      if (item.selectedGemstone) {
        itemPrice += Number(item.selectedGemstone.price);
      }

      const totalItemCost = itemPrice * item.quantity;
      subtotal += totalItemCost;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        selectedMetal: item.selectedMetal,
        selectedSize: item.selectedSize ? Number(item.selectedSize) : null,
        customEngraving: item.customEngraving,
        gemstone: item.selectedGemstone
          ? {
              id: item.selectedGemstone.id,
              type: item.selectedGemstone.type,
              carat: Number(item.selectedGemstone.carat),
              color: item.selectedGemstone.color,
              clarity: item.selectedGemstone.clarity,
              shape: item.selectedGemstone.shape,
              price: Number(item.selectedGemstone.price),
              certificateNumber: item.selectedGemstone.certificateNumber,
            }
          : null,
        unitPrice: itemPrice,
        totalPrice: totalItemCost,
      };
    });

    return {
      cartId: cart.id,
      items: itemsWithPricing,
      subtotal,
      itemCount: itemsWithPricing.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  static async addItemToCart(userId: string, itemData: AddToCartInput) {
    const { productId, quantity, selectedMetal, selectedSize, customEngraving, selectedGemstoneId } = itemData;

    // Check if listing exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { metalConfigs: true },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new AppError('Product listing not found or is currently archived.', 404);
    }

    // Verify diamond status if customization references a loose stone
    if (selectedGemstoneId) {
      const stone = await prisma.gemstone.findUnique({ where: { id: selectedGemstoneId } });
      if (!stone || stone.status !== 'AVAILABLE') {
        throw new AppError('Selected loose diamond is no longer available.', 400);
      }
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if identical item configuration exists to increment quantity
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        selectedMetal,
        selectedSize,
        customEngraving,
        selectedGemstoneId,
      },
    });

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        selectedMetal,
        selectedSize,
        customEngraving,
        selectedGemstoneId,
      },
    });
  }

  static async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found.', 404);
    }

    if (quantity <= 0) {
      return await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    }

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  static async removeCartItem(userId: string, cartItemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found.', 404);
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { id: cartItemId };
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}
