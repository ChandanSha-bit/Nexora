import express from 'express';
import { getUsersForSidebar, updateProfile, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected by JWT auth middleware
router.get('/', protect, getUsersForSidebar);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
