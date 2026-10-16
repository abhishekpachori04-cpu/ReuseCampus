import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  getMyListings,
} from '../controllers/listingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/user/my-listings', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);

export default router;
