import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { MetalType, Shape, GemstoneStatus } from '../types/prisma.mock';

export interface ProductInput {
  name: string;
  sku: string;
  description: string;
  basePrice: number;
  categoryId: string;
  isCustomizable?: boolean;
  status?: string;
  metalConfigs?: Array<{ metalType: MetalType; priceAdjustment: number }>;
  variants?: Array<{
    sku: string;
    metalType: MetalType;
    ringSize?: number | null;
    price: number;
    stock: number;
    imageUrls: string[];
  }>;
  collectionIds?: string[];
}

export class ProductService {
  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private static formatProductVariants(product: any) {
    if (!product) return null;
    return {
      ...product,
      variants: product.variants?.map((v: any) => ({
        ...v,
        imageUrls: typeof v.imageUrls === 'string' ? JSON.parse(v.imageUrls || '[]') : v.imageUrls,
      })) || [],
    };
  }

  static async getProducts(filters: {
    categorySlug?: string;
    collectionSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    isCustomizable?: boolean;
    metalType?: MetalType;
    status?: string;
    limit?: number;
    page?: number;
    search?: string;
    sort?: string;
    gemstoneType?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Filter by status (Defaults to ACTIVE for public routes)
    whereClause.status = filters.status || 'ACTIVE';

    // Category filter
    if (filters.categorySlug) {
      whereClause.category = {
        OR: [
          { slug: filters.categorySlug },
          { parent: { slug: filters.categorySlug } },
        ],
      };
    }

    // Collection filter
    if (filters.collectionSlug) {
      whereClause.collections = {
        some: { slug: filters.collectionSlug },
      };
    }

    // Customization filter
    if (filters.isCustomizable !== undefined) {
      whereClause.isCustomizable = filters.isCustomizable;
    }

    // Metal type configurations filtering
    if (filters.metalType) {
      whereClause.metalConfigs = {
        some: { metalType: filters.metalType },
      };
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.basePrice = {};
      if (filters.minPrice !== undefined) whereClause.basePrice.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) whereClause.basePrice.lte = filters.maxPrice;
    }

    // Text search query
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    // Gemstone type filter (falls back to text match on catalog products)
    if (filters.gemstoneType) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { name: { contains: filters.gemstoneType } },
        { description: { contains: filters.gemstoneType } },
      ];
    }

    // Dynamic sorting
    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          orderBy = { basePrice: 'asc' };
          break;
        case 'price_desc':
          orderBy = { basePrice: 'desc' };
          break;
        case 'popular':
          orderBy = { rating: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: { select: { name: true, slug: true } },
          metalConfigs: true,
          variants: { select: { imageUrls: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return {
      products: products.map((p) => this.formatProductVariants(p)),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        metalConfigs: true,
        variants: true,
        collections: { select: { name: true, slug: true } },
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product listing not found.', 404);
    }

    return this.formatProductVariants(product);
  }

  static async createProduct(data: ProductInput) {
    const slug = this.slugify(data.name);

    // Duplicate check
    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku: data.sku }] },
    });
    if (existing) {
      throw new AppError('Product slug or baseline SKU already exists.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug,
          sku: data.sku,
          description: data.description,
          basePrice: data.basePrice,
          categoryId: data.categoryId,
          isCustomizable: data.isCustomizable || false,
          status: data.status || 'DRAFT',
          ...(data.collectionIds && {
            collections: {
              connect: data.collectionIds.map((id) => ({ id })),
            },
          }),
        },
      });

      // Insert metal price modifiers
      if (data.metalConfigs && data.metalConfigs.length > 0) {
        await tx.productMetalConfig.createMany({
          data: data.metalConfigs.map((cfg) => ({
            productId: product.id,
            metalType: cfg.metalType,
            priceAdjustment: cfg.priceAdjustment,
          })),
        });
      }

      // Insert preconfigured variants
      if (data.variants && data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: product.id,
            sku: v.sku,
            metalType: v.metalType,
            ringSize: v.ringSize,
            price: v.price,
            stock: v.stock,
            imageUrls: JSON.stringify(v.imageUrls),
          })),
        });
      }

      const created = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          metalConfigs: true,
          variants: true,
          collections: true,
        },
      });
      return this.formatProductVariants(created);
    });
  }

  static async updateProduct(productId: string, data: Partial<ProductInput>) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    const updateData: any = { ...data };
    delete updateData.metalConfigs;
    delete updateData.variants;
    delete updateData.collectionIds;

    if (data.name) {
      updateData.slug = this.slugify(data.name);
    }

    return await prisma.$transaction(async (tx) => {
      // Connect/Disconnect collections if provided
      if (data.collectionIds) {
        await tx.product.update({
          where: { id: productId },
          data: {
            collections: {
              set: data.collectionIds.map((id) => ({ id })),
            },
          },
        });
      }

      // Recreate metal configurations if provided (simpler to reset and write)
      if (data.metalConfigs) {
        await tx.productMetalConfig.deleteMany({ where: { productId } });
        await tx.productMetalConfig.createMany({
          data: data.metalConfigs.map((cfg) => ({
            productId,
            metalType: cfg.metalType,
            priceAdjustment: cfg.priceAdjustment,
          })),
        });
      }

      // Recreate variants if provided
      if (data.variants) {
        await tx.productVariant.deleteMany({ where: { productId } });
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId,
            sku: v.sku,
            metalType: v.metalType,
            ringSize: v.ringSize,
            price: v.price,
            stock: v.stock,
            imageUrls: JSON.stringify(v.imageUrls),
          })),
        });
      }

      // Update primary product listing metadata
      const updated = await tx.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          metalConfigs: true,
          variants: true,
        },
      });
      return this.formatProductVariants(updated);
    });
  }

  static async deleteProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { id: productId };
  }

  // --- LOOSE DIAMONDS MANAGEMENT ---
  static async getLooseDiamonds(filters: {
    shape?: Shape;
    color?: string;
    clarity?: string;
    minCarat?: number;
    maxCarat?: number;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    page?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: GemstoneStatus.AVAILABLE,
    };

    if (filters.shape) whereClause.shape = filters.shape;
    if (filters.color) whereClause.color = filters.color;
    if (filters.clarity) whereClause.clarity = filters.clarity;

    if (filters.minCarat !== undefined || filters.maxCarat !== undefined) {
      whereClause.carat = {};
      if (filters.minCarat !== undefined) whereClause.carat.gte = filters.minCarat;
      if (filters.maxCarat !== undefined) whereClause.carat.lte = filters.maxCarat;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.price = {};
      if (filters.minPrice !== undefined) whereClause.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) whereClause.price.lte = filters.maxPrice;
    }

    const [diamonds, totalCount] = await Promise.all([
      prisma.gemstone.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { carat: 'asc' },
      }),
      prisma.gemstone.count({ where: whereClause }),
    ]);

    return {
      diamonds,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async addLooseDiamond(data: {
    type?: string;
    shape: Shape;
    carat: number;
    color: string;
    clarity: string;
    cut?: string;
    certificateNumber?: string;
    certificateUrl?: string;
    price: number;
  }) {
    if (data.certificateNumber) {
      const existing = await prisma.gemstone.findUnique({
        where: { certificateNumber: data.certificateNumber },
      });
      if (existing) {
        throw new AppError('Gemstone certificate number already registered in vault.', 400);
      }
    }

    return await prisma.gemstone.create({
      data: {
        type: data.type || 'DIAMOND',
        shape: data.shape,
        carat: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        certificateNumber: data.certificateNumber,
        certificateUrl: data.certificateUrl,
        price: data.price,
      },
    });
  }
}
