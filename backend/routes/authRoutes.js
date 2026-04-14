import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordResetOtp,
  sendPasswordResetTestEmail,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  requestDeleteAccountOtp,
  deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/test-reset-email', sendPasswordResetTestEmail);
router.post('/forgot-password', requestPasswordResetOtp);
router.post('/verify-reset-otp', verifyPasswordResetOtp);
router.post('/reset-password', resetPasswordWithOtp);
router.post('/delete-account/request-otp', protect, requestDeleteAccountOtp);
router.delete('/delete-account', protect, deleteAccount);

export default router;
