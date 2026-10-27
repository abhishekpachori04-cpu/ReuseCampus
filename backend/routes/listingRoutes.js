import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  markAsSold,
  markListingAsSold,
  updateListingStatus,
  getMyListings,
} from '../controllers/listingController.js';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// PRD Section 24.2: Listings API Endpoints
router.get('/', getListings);

// Protected: User's own listings (supporting /my, /user, and /user/my-listings)
router.get('/my', protect, getMyListings);
router.get('/user', protect, getMyListings);
router.get('/user/my-listings', protect, getMyListings);

// Detail, Create, Update, Delete
router.get('/:id', getListingById);
router.post('/', protect, upload.single('image'), createListing);
router.put('/:id', protect, upload.single('image'), updateListing);
router.delete('/:id', protect, deleteListing);

// Stage 2: Mark as Sold & Status toggling
router.patch('/:id/sell', protect, markAsSold);
router.patch('/:id/sold', protect, markAsSold);
router.patch('/:id/status', protect, updateListingStatus);

export default router;
