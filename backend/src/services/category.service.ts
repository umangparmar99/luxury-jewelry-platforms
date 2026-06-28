import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface CategoryInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
}

export class CategoryService {
  static async getCategories() {
    // Return complete hierarchy tree starting with root categories (parentId = null)
    return await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true, // Support up to 3 levels deep
          },
        },
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    return category;
  }

  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }

  static async createCategory(data: CategoryInput) {
    const slug = this.slugify(data.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Category slug already exists.', 400);
    }

    return await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
      },
    });
  }

  static async updateCategory(categoryId: string, data: Partial<CategoryInput>) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = this.slugify(data.name);
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });
  }

  static async deleteCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    if (category.children.length > 0) {
      throw new AppError('Cannot delete a category that contains child elements. Delete subcategories first.', 400);
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { id: categoryId };
  }
}
