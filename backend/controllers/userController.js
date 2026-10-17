import User from '../models/User.js';
import Listing from '../models/Listing.js';

/**
 * @desc    Get current logged in user profile with listings count
 * @route   GET /api/users/me
 * @access  Private (PRD Section 21 & 24.3)
 */
export const getUserProfile = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged in user profile
 * @route   PUT /api/users/me
 * @access  Private (PRD Section 21 & 24.3)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
