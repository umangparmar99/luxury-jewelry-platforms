import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CollectionService } from '../services/collection.service';
import { ApiResponse } from '../utils/ApiResponse';
import { Shape, MetalType } from '../types/prisma.mock';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { InMemoryCache } from '../utils/cache';

export class CatalogController {
  // --- PRODUCTS ---
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        collection,
        minPrice,
        maxPrice,
        isCustomizable,
        metal,
        status,
        limit,
        page,
        search,
        sort,
        gemstone,
      } = req.query;

      // Check cache first
      const cacheKey = `catalog:products:${JSON.stringify(req.query)}`;
      const cached = InMemoryCache.get(cacheKey);
      if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
        return ApiResponse.success(res, 'Products catalog retrieved.', cached);
      }

      const filters = {
        categorySlug: category ? String(category) : undefined,
        collectionSlug: collection ? String(collection) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isCustomizable: isCustomizable !== undefined ? isCustomizable === 'true' : undefined,
        metalType: metal ? (String(metal) as MetalType) : undefined,
        status: status ? String(status) : undefined,
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
        search: search ? String(search) : undefined,
        sort: sort ? String(sort) : undefined,
        gemstoneType: gemstone ? String(gemstone) : undefined,
      };

      const result = await ProductService.getProducts(filters);
      
      // Store in cache for 60 seconds
      InMemoryCache.set(cacheKey, result, 60000);
      
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return ApiResponse.success(res, 'Products catalog retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  static async getProductDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);
      return ApiResponse.success(res, 'Product details retrieved.', product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      InMemoryCache.clear();
      return ApiResponse.success(res, 'Product listed successfully.', product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);
      InMemoryCache.clear();
      return ApiResponse.success(res, 'Product updated successfully.', product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await ProductService.deleteProduct(id);
      InMemoryCache.clear();
      return ApiResponse.success(res, 'Product removed successfully.', response);
    } catch (error) {
      next(error);
    }
  }

  // --- LOOSE DIAMONDS ---
  static async listDiamonds(req: Request, res: Response, next: NextFunction) {
    try {
      const { shape, color, clarity, minCarat, maxCarat, minPrice, maxPrice, limit, page } = req.query;

      const filters = {
        shape: shape ? (String(shape) as Shape) : undefined,
        color: color ? String(color) : undefined,
        clarity: clarity ? String(clarity) : undefined,
        minCarat: minCarat ? Number(minCarat) : undefined,
        maxCarat: maxCarat ? Number(maxCarat) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      };

      const result = await ProductService.getLooseDiamonds(filters);
      return ApiResponse.success(res, 'Loose diamonds index retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  static async createDiamond(req: Request, res: Response, next: NextFunction) {
    try {
      const diamond = await ProductService.addLooseDiamond(req.body);
      return ApiResponse.success(res, 'Loose diamond registered.', diamond, 201);
    } catch (error) {
      next(error);
    }
  }

  // --- CATEGORIES ---
  static async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await CategoryService.getCategories();
      return ApiResponse.success(res, 'Categories hierarchy tree retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.success(res, 'Category registered.', category, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.updateCategory(id, req.body);
      return ApiResponse.success(res, 'Category details updated.', category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await CategoryService.deleteCategory(id);
      return ApiResponse.success(res, 'Category removed.', response);
    } catch (error) {
      next(error);
    }
  }

  // --- COLLECTIONS ---
  static async listCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await CollectionService.getCollections();
      return ApiResponse.success(res, 'Collections index retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  static async getCollectionDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const collection = await CollectionService.getCollectionBySlug(slug);
      return ApiResponse.success(res, 'Collection details retrieved.', collection);
    } catch (error) {
      next(error);
    }
  }

  static async createCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await CollectionService.createCollection(req.body);
      return ApiResponse.success(res, 'Collection created.', collection, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const collection = await CollectionService.updateCollection(id, req.body);
      return ApiResponse.success(res, 'Collection updated.', collection);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await CollectionService.deleteCollection(id);
      return ApiResponse.success(res, 'Collection deleted.', response);
    } catch (error) {
      next(error);
    }
  }

  static async addProductsToCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { productIds } = req.body;
      const updated = await CollectionService.addProductsToCollection(id, productIds);
      return ApiResponse.success(res, 'Products linked to collection.', updated);
    } catch (error) {
      next(error);
    }
  }

  // --- INVENTORY MANAGEMENT ---
  static async listInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const variants = await prisma.productVariant.findMany({
        include: {
          product: { select: { name: true, sku: true } }
        },
        orderBy: { stock: 'asc' }
      });
      const gemstones = await prisma.gemstone.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return ApiResponse.success(res, 'Inventory listings loaded.', { variants, gemstones });
    } catch (error) {
      next(error);
    }
  }

  static async updateVariantStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      if (stock === undefined) {
        throw new AppError('Stock count value is required.', 400);
      }
      const updated = await prisma.productVariant.update({
        where: { id },
        data: { stock: Number(stock) }
      });
      return ApiResponse.success(res, 'Variant stock updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  static async updateGemstoneStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        throw new AppError('Gemstone status is required.', 400);
      }
      const updated = await prisma.gemstone.update({
        where: { id },
        data: { status }
      });
      return ApiResponse.success(res, 'Gemstone status updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  }
}
