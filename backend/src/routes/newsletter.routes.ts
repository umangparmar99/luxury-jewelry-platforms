import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { newsletterSchema } from '../models/request-schemas';

const router = Router();

// Public Routes
router.post('/subscribe', validate(newsletterSchema), NewsletterController.subscribe);
router.post('/unsubscribe', validate(newsletterSchema), NewsletterController.unsubscribe);

// Protected Admin Routes
router.get('/subscribers', protect, restrictTo('ADMIN'), NewsletterController.listSubscribers);

export default router;
