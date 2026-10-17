import mongoose from 'mongoose';

/**
 * Validates college email against configurable environment variable ALLOWED_EMAIL_DOMAINS
 * Fallbacks to standard college/university institutional domains (.edu, .ac.*, etc.)
 * as specified in PRD Section 8.
 */
export const isCollegeEmailValid = (email) => {
  if (!email || typeof email !== 'string') return false;
  const lowerEmail = email.toLowerCase().trim();
  const domain = lowerEmail.split('@')[1];
  if (!domain) return false;

  const envDomains = process.env.ALLOWED_EMAIL_DOMAINS
    ? process.env.ALLOWED_EMAIL_DOMAINS.split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
    : [];

  if (envDomains.length > 0) {
    return envDomains.some((d) => domain === d || domain.endsWith('.' + d));
  }

  // Fallback: general institutional educational domain regex
  const institutionalRegex =
    /^[^\s@]+@([^\s@]+\.)?(edu|ac\.[a-z]{2,}|edu\.[a-z]{2,}|college\.edu|univ\.[a-z]{2,})$/i;
  return institutionalRegex.test(lowerEmail);
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your institutional college email address'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return isCollegeEmailValid(value);
        },
        message: (props) =>
          `${props.value} is not an authorized college email address for this campus.`,
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    college: {
      type: String,
      required: [true, 'Please specify your college or university name'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
  },
  {
    timestamps: true,
  }
);

// Method to exclude sensitive fields when transforming user to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
