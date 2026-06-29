import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { blogSchema } from '../models/request-schemas';

const router = Router();

// Public Routes
router.get('/', BlogController.listBlogs);
router.get('/:slug', BlogController.getBlogDetails);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/admin/list', BlogController.listAllBlogsAdmin);
router.post('/admin', validate(blogSchema), BlogController.createBlog);
router.patch('/admin/:id', validate(blogSchema), BlogController.updateBlog);
router.delete('/admin/:id', BlogController.deleteBlog);

export default router;
