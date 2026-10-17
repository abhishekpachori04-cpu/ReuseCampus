import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  markListingAsSold,
  getMyListings,
} from '../controllers/listingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PRD Section 24.2: Listings API Endpoints
router.get('/', getListings);
router.get('/user/my-listings', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/sold', protect, markListingAsSold);

export default router;
