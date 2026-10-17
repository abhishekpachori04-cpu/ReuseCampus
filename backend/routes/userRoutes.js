import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PRD Section 24.3: Profile endpoints
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);

export default router;
