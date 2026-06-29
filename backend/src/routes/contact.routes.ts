import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { contactSchema } from '../models/request-schemas';

const router = Router();

// Public message submission
router.post('/', validate(contactSchema), ContactController.submitMessage);

// Protected administrative review routes
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/admin', ContactController.listMessages);
router.patch('/admin/:id/read', ContactController.markAsRead);

export default router;
