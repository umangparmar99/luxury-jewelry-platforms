import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { brandSchema } from '../models/request-schemas';

const router = Router();

// Public Routes
router.get('/', BrandController.listBrands);
router.get('/:slug', BrandController.getBrandDetails);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', validate(brandSchema), BrandController.createBrand);
router.patch('/:id', validate(brandSchema), BrandController.updateBrand);
router.delete('/:id', BrandController.deleteBrand);

export default router;
