import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';

export class BlogService {
  static async getBlogs(filters: { isPublishedOnly?: boolean; limit?: number; page?: number } = {}) {
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.isPublishedOnly) {
      where.publishedAt = { not: null };
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getBlogById(id: string) {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });
    if (!blog) {
      throw new AppError('Blog article not found.', 404);
    }
    return blog;
  }

  static async getBlogBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });
    if (!blog) {
      throw new AppError('Blog article not found.', 404);
    }
    return blog;
  }

  static async createBlog(data: {
    title: string;
    content: string;
    summary?: string | null;
    imageUrl?: string | null;
    authorName: string;
    publish?: boolean;
  }) {
    const slug = slugify(data.title);
    
    // Check duplication
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Blog article title must be unique.', 400);
    }

    const publishedAt = data.publish ? new Date() : null;

    return await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary,
        imageUrl: data.imageUrl,
        authorName: data.authorName,
        publishedAt,
      },
    });
  }

  static async updateBlog(
    id: string,
    data: {
      title?: string;
      content?: string;
      summary?: string | null;
      imageUrl?: string | null;
      authorName?: string;
      publish?: boolean;
    }
  ) {
    const blog = await this.getBlogById(id);
    const updateData: any = { ...data };

    if (data.title && data.title !== blog.title) {
      const slug = slugify(data.title);
      const existing = await prisma.blog.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new AppError('A blog with this title already exists.', 400);
      }
      updateData.slug = slug;
    }

    if (data.publish !== undefined) {
      if (data.publish) {
        updateData.publishedAt = blog.publishedAt || new Date();
      } else {
        updateData.publishedAt = null;
      }
      delete updateData.publish;
    }

    return await prisma.blog.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteBlog(id: string) {
    await this.getBlogById(id);
    return await prisma.blog.delete({
      where: { id },
    });
  }
}
