import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  productSchema,
  categorySchema,
  collectionSchema,
} from '../models/request-schemas';

const router = Router();

// --- PUBLIC ROUTINGS ---

// Products
router.get('/products', CatalogController.listProducts);
router.get('/products/:slug', CatalogController.getProductDetails);

// Diamonds
router.get('/diamonds', CatalogController.listDiamonds);

// Categories
router.get('/categories', CatalogController.listCategories);

// Collections
router.get('/collections', CatalogController.listCollections);
router.get('/collections/:slug', CatalogController.getCollectionDetails);

// --- PROTECTED ROUTINGS ---

// Admin and Order Managers only
router.use(protect);
router.use(restrictTo('ADMIN', 'ORDER_MANAGER', 'GEMOLOGIST'));

// Admin Category overrides
router.post('/categories', validate(categorySchema), CatalogController.createCategory);
router.patch('/categories/:id', validate(categorySchema), CatalogController.updateCategory);
router.delete('/categories/:id', CatalogController.deleteCategory);

// Admin Collection overrides
router.post('/collections', validate(collectionSchema), CatalogController.createCollection);
router.patch('/collections/:id', validate(collectionSchema), CatalogController.updateCollection);
router.delete('/collections/:id', CatalogController.deleteCollection);
router.post('/collections/:id/products', CatalogController.addProductsToCollection);

// Admin/Gemologist product overrides
router.post('/products', validate(productSchema), CatalogController.createProduct);
router.patch('/products/:id', validate(productSchema), CatalogController.updateProduct);
router.delete('/products/:id', CatalogController.deleteProduct);

// Loose diamond uploads
router.post('/diamonds', CatalogController.createDiamond);

// Admin inventory overrides
router.get('/admin/inventory', CatalogController.listInventory);
router.patch('/admin/inventory/variant/:id', CatalogController.updateVariantStock);
router.patch('/admin/inventory/gemstone/:id', CatalogController.updateGemstoneStatus);

export default router;
