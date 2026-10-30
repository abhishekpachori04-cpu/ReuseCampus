import User from '../models/User.js';
import Listing from '../models/Listing.js';

/**
 * @desc    Get current user profile with listings count
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const listingsCount = await Listing.countDocuments({ seller: req.user._id });

    return res.json({
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
    console.error('[Get User Profile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, college, phone, avatar } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty or whitespace only',
        });
      }
      user.name = name.trim();
    }

    if (college !== undefined) {
      if (typeof college !== 'string' || !college.trim()) {
        return res.status(400).json({
          success: false,
          message: 'College cannot be empty',
        });
      }
      user.college = college.trim();
    }

    if (phone !== undefined) {
      const trimmedPhone = typeof phone === 'string' ? phone.trim() : String(phone).trim();
      if (trimmedPhone && !/^(?:(?:\+|0{0,2})91[\s-]?)?[6789]\d{9}$/.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone format. Please provide a valid 10-digit Indian mobile number.',
        });
      }
      user.phone = trimmedPhone;
    }

    if (avatar !== undefined) {
      user.avatar = typeof avatar === 'string' ? avatar.trim() : '';
    }

    const updatedUser = await user.save();

    return res.json({
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
    console.error('[Update User Profile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};
