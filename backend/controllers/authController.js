import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { isCollegeEmailValid } from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_fallback', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new college user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, college, phone } = req.body;

    // Validate required fields as per PRD Section 7.1
    if (!name || !email || !password || !college) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, college email, password, college)',
      });
    }

    // Password confirmation check if confirmPassword is provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // PRD Section 8: College email verification against configured domain
    const trimmedEmail = email.toLowerCase().trim();
    if (!isCollegeEmailValid(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid college email. Registration is restricted to approved campus institutional email addresses.',
      });
    }

    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this college email already exists',
      });
    }

    // Salt and hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      college: college.trim(),
      phone: phone ? phone.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both college email and password',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid college email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid college email or password',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile (backward-compatible auth endpoint)
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};
