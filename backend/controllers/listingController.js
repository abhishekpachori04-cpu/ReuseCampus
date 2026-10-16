import Listing from '../models/Listing.js';

/**
 * @desc    Get all listings (with optional filtering by category/search/status)
 * @route   GET /api/listings
 * @access  Public
 */
export const getListings = async (req, res, next) => {
  try {
    const { category, search, condition, status = 'AVAILABLE' } = req.query;

    const query = { status };

    if (category) {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const listings = await Listing.find(query)
      .populate('seller', 'name email college avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single listing details
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'seller',
      'name email college phone avatar'
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new listing
 * @route   POST /api/listings
 * @access  Private
 */
export const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, imageUrl } = req.body;

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      imageUrl,
      seller: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get listings created by the logged-in user
 * @route   GET /api/listings/user/my-listings
 * @access  Private
 */
export const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};
