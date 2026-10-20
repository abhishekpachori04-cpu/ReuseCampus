import User from '../models/User.js';
import Listing from '../models/Listing.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get current user profile with listings count
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found',
    });
  }

  const listingsCount = await Listing.countDocuments({ seller: req.user._id });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      phone: user.phone,
      avatar: user.avatar,
      listingsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const { name, college, phone, avatar } = req.body;

  if (name) user.name = name.trim();
  if (college) user.college = college.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar) user.avatar = avatar.trim();

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      college: updatedUser.college,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
    message: 'Profile updated successfully',
  });
});
