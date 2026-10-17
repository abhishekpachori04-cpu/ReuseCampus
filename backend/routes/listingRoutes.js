import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  markListingAsSold,
  updateListingStatus,
  getMyListings,
} from '../controllers/listingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PRD Section 24.2: Listings API Endpoints
router.get('/', getListings);

// Protected: User's own listings (supporting /my, /user, and /user/my-listings)
router.get('/my', protect, getMyListings);
router.get('/user', protect, getMyListings);
router.get('/user/my-listings', protect, getMyListings);

// Detail, Create, Update, Delete
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

// Status toggling (PRD Section 17 & 24.2)
router.patch('/:id/sold', protect, markListingAsSold);
router.patch('/:id/status', protect, updateListingStatus);

export default router;
