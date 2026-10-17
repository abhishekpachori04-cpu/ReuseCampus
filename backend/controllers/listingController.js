import mongoose from 'mongoose';
import Listing, { CATEGORIES, CONDITIONS, STATUSES } from '../models/Listing.js';

/**
 * @desc    Get all listings (with search, category, condition, price range, and status filters)
 * @route   GET /api/listings
 * @access  Public (PRD Section 9, 15, 16, 22.1, 24.2)
 */
export const getListings = async (req, res, next) => {
  try {
    const { category, search, condition, status, minPrice, maxPrice } = req.query;

    const query = {};

    // By default only return AVAILABLE listings unless explicitly requested
    if (status) {
      if (status !== 'ALL') {
        query.status = status;
      }
    } else {
      query.status = 'AVAILABLE';
    }

    // Category filter (PRD Section 10 & 16)
    if (category && category !== 'All') {
      query.category = category;
    }

    // Condition filter (PRD Section 11 & 16)
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Price range filters (PRD Section 16)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        const parsedMin = Number(minPrice);
        if (!isNaN(parsedMin)) query.price.$gte = parsedMin;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const parsedMax = Number(maxPrice);
        if (!isNaN(parsedMax)) query.price.$lte = parsedMax;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Search keyword query on title and description (PRD Section 15)
    if (search && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const listings = await Listing.find(query)
      .populate('seller', 'name email college phone avatar')
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
 * @access  Public (PRD Section 13, 22.1, 24.2)
 */
export const getListingById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format',
      });
    }

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
 * @access  Private (PRD Section 11, 22.2, 24.2)
 */
export const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, imageUrl } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || !category || !condition || !imageUrl) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields (title, description, price, category, condition, imageUrl)',
      });
    }

    // Validate category against PRD Section 10
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category '${category}'. Must be one of: ${CATEGORIES.join(', ')}`,
      });
    }

    // Validate condition against PRD Section 11
    if (!CONDITIONS.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Invalid condition '${condition}'. Must be one of: ${CONDITIONS.join(', ')}`,
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      category,
      condition,
      imageUrl: imageUrl.trim(),
      seller: req.user._id,
      status: 'AVAILABLE',
    });

    const populatedListing = await listing.populate(
      'seller',
      'name email college phone avatar'
    );

    res.status(201).json({
      success: true,
      data: populatedListing,
      message: 'Listing created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing listing
 * @route   PUT /api/listings/:id
 * @access  Private (PRD Section 19, 22.2, 22.3, 24.2)
 */
export const updateListing = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format',
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // PRD Section 22.3: Ownership Check
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own listings',
      });
    }

    const { title, description, price, category, condition, imageUrl, status } = req.body;

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category '${category}'. Supported categories: ${CATEGORIES.join(', ')}`,
      });
    }

    if (condition && !CONDITIONS.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Invalid condition '${condition}'. Supported: ${CONDITIONS.join(', ')}`,
      });
    }

    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Supported: ${STATUSES.join(', ')}`,
      });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number',
        });
      }
      listing.price = numPrice;
    }

    if (title) listing.title = title.trim();
    if (description) listing.description = description.trim();
    if (category) listing.category = category;
    if (condition) listing.condition = condition;
    if (imageUrl) listing.imageUrl = imageUrl.trim();
    if (status) listing.status = status;

    const updatedListing = await listing.save();
    const populated = await updatedListing.populate('seller', 'name email college phone avatar');

    res.json({
      success: true,
      data: populated,
      message: 'Listing updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a listing
 * @route   DELETE /api/listings/:id
 * @access  Private (PRD Section 20, 22.2, 22.3, 24.2)
 */
export const deleteListing = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format',
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // PRD Section 22.3: Ownership Check
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own listings',
      });
    }

    await listing.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Listing removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a listing as SOLD
 * @route   PATCH /api/listings/:id/sold
 * @access  Private (PRD Section 17, 18, 22.2, 22.3, 24.2)
 */
export const markListingAsSold = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format',
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // PRD Section 17 & 22.3: Only listing owner can mark as sold
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the listing owner can mark this item as sold',
      });
    }

    listing.status = 'SOLD';
    const savedListing = await listing.save();
    const populated = await savedListing.populate('seller', 'name email college phone avatar');

    res.json({
      success: true,
      data: populated,
      message: 'Listing marked as SOLD successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get listings created by the logged-in user
 * @route   GET /api/listings/user/my-listings
 * @access  Private (PRD Section 18, 22.2)
 */
export const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('seller', 'name email college phone avatar')
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
