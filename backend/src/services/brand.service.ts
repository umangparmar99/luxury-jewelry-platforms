import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';

export class BrandService {
  static async getBrands() {
    return await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getBrandById(id: string) {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });
    if (!brand) {
      throw new AppError('Brand details not found.', 404);
    }
    return brand;
  }

  static async getBrandBySlug(slug: string) {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: { category: true, variants: true, images: true }
        }
      }
    });
    if (!brand) {
      throw new AppError('Brand details not found.', 404);
    }
    return brand;
  }

  static async createBrand(data: { name: string; description?: string | null; imageUrl?: string | null }) {
    const slug = slugify(data.name);

    // Check if brand with slug already exists
    const existing = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug }
        ]
      }
    });

    if (existing) {
      throw new AppError('Brand name or identifier already registered.', 400);
    }

    return await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
  }

  static async updateBrand(id: string, data: { name?: string; description?: string | null; imageUrl?: string | null }) {
    const brand = await this.getBrandById(id);
    const updateData: any = { ...data };

    if (data.name && data.name !== brand.name) {
      const slug = slugify(data.name);
      // Verify duplicate
      const existing = await prisma.brand.findFirst({
        where: {
          OR: [
            { name: data.name },
            { slug }
          ],
          NOT: { id }
        }
      });
      if (existing) {
        throw new AppError('A brand with this name or identifier already exists.', 400);
      }
      updateData.slug = slug;
    }

    return await prisma.brand.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteBrand(id: string) {
    await this.getBrandById(id);
    
    // Dissolve references
    await prisma.product.updateMany({
      where: { brandId: id },
      data: { brandId: null }
    });

    return await prisma.brand.delete({
      where: { id },
    });
  }
}
