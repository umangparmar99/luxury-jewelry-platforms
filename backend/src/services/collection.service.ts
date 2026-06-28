import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface CollectionInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export class CollectionService {
  static async getCollections() {
    return await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCollectionBySlug(slug: string) {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            metalConfigs: true,
          },
        },
      },
    });

    if (!collection) {
      throw new AppError('Collection not found.', 404);
    }

    return collection;
  }

  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  static async createCollection(data: CollectionInput) {
    const slug = this.slugify(data.name);

    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Collection slug already exists.', 400);
    }

    return await prisma.collection.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
  }

  static async updateCollection(collectionId: string, data: Partial<CollectionInput>) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) {
      throw new AppError('Collection not found.', 404);
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = this.slugify(data.name);
    }

    return await prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
    });
  }

  static async deleteCollection(collectionId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) {
      throw new AppError('Collection not found.', 404);
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return { id: collectionId };
  }

  static async addProductsToCollection(collectionId: string, productIds: string[]) {
    return await prisma.collection.update({
      where: { id: collectionId },
      data: {
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
      include: { products: true },
    });
  }

  static async removeProductsFromCollection(collectionId: string, productIds: string[]) {
    return await prisma.collection.update({
      where: { id: collectionId },
      data: {
        products: {
          disconnect: productIds.map((id) => ({ id })),
        },
      },
      include: { products: true },
    });
  }
}
