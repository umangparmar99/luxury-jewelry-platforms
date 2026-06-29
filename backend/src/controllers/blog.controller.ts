import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/blog.service';
import { ApiResponse } from '../utils/ApiResponse';

export class BlogController {
  static async listBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const results = await BlogService.getBlogs({ isPublishedOnly: true, page, limit });
      return ApiResponse.success(res, 'Blogs list retrieved.', results);
    } catch (error) {
      next(error);
    }
  }

  static async getBlogDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const blog = await BlogService.getBlogBySlug(slug);
      return ApiResponse.success(res, 'Blog details retrieved.', blog);
    } catch (error) {
      next(error);
    }
  }

  static async listAllBlogsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const results = await BlogService.getBlogs({ isPublishedOnly: false, page, limit });
      return ApiResponse.success(res, 'All administrative blogs retrieved.', results);
    } catch (error) {
      next(error);
    }
  }

  static async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await BlogService.createBlog(req.body);
      return ApiResponse.success(res, 'Blog article created successfully.', blog, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await BlogService.updateBlog(id, req.body);
      return ApiResponse.success(res, 'Blog article updated successfully.', blog);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await BlogService.deleteBlog(id);
      return ApiResponse.success(res, 'Blog article deleted successfully.', response);
    } catch (error) {
      next(error);
    }
  }
}
