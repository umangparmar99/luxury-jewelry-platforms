import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';
import { ApiResponse } from '../utils/ApiResponse';

export class BrandController {
  static async listBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await BrandService.getBrands();
      return ApiResponse.success(res, 'Brands list retrieved.', brands);
    } catch (error) {
      next(error);
    }
  }

  static async getBrandDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const brand = await BrandService.getBrandBySlug(slug);
      return ApiResponse.success(res, 'Brand details retrieved.', brand);
    } catch (error) {
      next(error);
    }
  }

  static async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await BrandService.createBrand(req.body);
      return ApiResponse.success(res, 'Brand created successfully.', brand, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await BrandService.updateBrand(id, req.body);
      return ApiResponse.success(res, 'Brand details updated successfully.', brand);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await BrandService.deleteBrand(id);
      return ApiResponse.success(res, 'Brand deleted successfully.', response);
    } catch (error) {
      next(error);
    }
  }
}
