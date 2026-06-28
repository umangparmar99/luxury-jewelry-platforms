import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  otpVerifySchema,
  updateProfileSchema,
  addressSchema,
} from '../models/request-schemas';

const router = Router();

// Public Auth routes
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/google', AuthController.googleLogin);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.post('/verify-email', validate(otpVerifySchema), AuthController.verifyEmailOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// Protected Auth/Profile routes
router.use(protect);

router.get('/profile', AuthController.getProfile);
router.patch('/profile', validate(updateProfileSchema), AuthController.updateProfile);
router.post('/profile/kyc', AuthController.submitKyc);
router.post('/change-password', AuthController.changePassword);

// Address Management
router.get('/addresses', AuthController.listAddresses);
router.post('/addresses', validate(addressSchema), AuthController.createAddress);
router.patch('/addresses/:addressId', validate(addressSchema), AuthController.updateAddress);
router.delete('/addresses/:addressId', AuthController.deleteAddress);

// Admin-only KYC verification
router.patch(
  '/profile/kyc/verify',
  restrictTo('ADMIN', 'GEMOLOGIST'),
  AuthController.verifyKyc
);

// Admin-only User overrides
router.get('/admin/users', restrictTo('ADMIN', 'ORDER_MANAGER'), AuthController.listAllUsers);
router.patch('/admin/users/:id/role', restrictTo('ADMIN'), AuthController.updateUserRole);

export default router;
