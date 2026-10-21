import mongoose from 'mongoose';
import Listing, { CATEGORIES, CONDITIONS, STATUSES } from '../models/Listing.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Fetch listings with keyword search, category, condition, price range, and sort
 * @route   GET /api/listings
 * @access  Public
 */
export const getListings = asyncHandler(async (req, res) => {
  const { category, search, condition, status, minPrice, maxPrice, isFree, sort, ids } = req.query;

  const query = {};

  // Wishlist or batch ID filtering
  if (ids) {
    const idList = ids
      .split(',')
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (idList.length > 0) {
      query._id = { $in: idList };
    } else {
      query._id = { $in: [] };
    }
  }

  // Status filter: defaults to AVAILABLE unless ALL or specific status requested
  if (status && status !== 'ALL') {
    query.status = status;
  } else if (!status) {
    query.status = 'AVAILABLE';
  }

  // Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // Condition filter
  if (condition && condition !== 'All') {
    query.condition = condition;
  }

  // Pricing & giveaway filters
  if (isFree === 'true' || isFree === true) {
    query.price = 0;
  } else if (minPrice !== undefined || maxPrice !== undefined) {
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

  // Case-insensitive keyword search across title and description
  if (search && search.trim() !== '') {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  // Sort order mapping
  let sortCriteria = { createdAt: -1 };
  if (sort === 'price_asc') {
    sortCriteria = { price: 1, createdAt: -1 };
  } else if (sort === 'price_desc') {
    sortCriteria = { price: -1, createdAt: -1 };
  } else if (sort === 'newest') {
    sortCriteria = { createdAt: -1 };
  }

  // Pagination parameters (default page 1, limit 8)
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 8));
  const skip = (page - 1) * limit;

  // Run lean count and fetch queries concurrently for optimal throughput
  const [total, listings] = await Promise.all([
    Listing.countDocuments(query),
    Listing.find(query)
      .populate('seller', 'name email college phone avatar')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const pages = Math.ceil(total / limit) || 1;
  const hasMore = page < pages;

  res.json({
    success: true,
    count: listings.length,
    data: listings,
    pagination: {
      total,
      page,
      pages,
      hasMore,
    },
  });
});

/**
 * @desc    Fetch single listing details by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid listing ID format',
    });
  }

  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name email college phone avatar')
    .lean();

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
});

/**
 * @desc    Create a new listing
 * @route   POST /api/listings
 * @access  Private
 */
export const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, category, condition, imageUrl } = req.body;

  if (!title || !description || price === undefined || !category || !condition || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields (title, description, price, category, condition, imageUrl)',
    });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category '${category}'. Must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

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
});

/**
 * @desc    Update listing details (restricted to listing owner)
 * @route   PUT /api/listings/:id
 * @access  Private
 */
export const updateListing = asyncHandler(async (req, res) => {
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

  // Ownership verification
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
      message: `Invalid category '${category}'. Supported: ${CATEGORIES.join(', ')}`,
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
});

/**
 * @desc    Delete a listing (restricted to listing owner)
 * @route   DELETE /api/listings/:id
 * @access  Private
 */
export const deleteListing = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Mark a listing as SOLD
 * @route   PATCH /api/listings/:id/sold
 * @access  Private
 */
export const markListingAsSold = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Update listing status (AVAILABLE / SOLD)
 * @route   PATCH /api/listings/:id/status
 * @access  Private
 */
export const updateListingStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid listing ID format',
    });
  }

  const { status } = req.body;
  if (!status || !STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Must be one of: ${STATUSES.join(', ')}`,
    });
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found',
    });
  }

  if (listing.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: Only the listing owner can modify item status',
    });
  }

  listing.status = status;
  const savedListing = await listing.save();
  const populated = await savedListing.populate('seller', 'name email college phone avatar');

  res.json({
    success: true,
    data: populated,
    message: `Listing status updated to ${status} successfully`,
  });
});

/**
 * @desc    Fetch listings created by current logged-in student
 * @route   GET /api/listings/user/my-listings
 * @access  Private
 */
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id })
    .populate('seller', 'name email college phone avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: listings.length,
    data: listings,
  });
});
