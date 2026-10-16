import mongoose from 'mongoose';

/**
 * College Email Validation Regex:
 * Matches emails ending in .edu, .ac.<country>, .edu.<country>, or containing campus/university/college subdomains
 */
const collegeEmailRegex = /^[^\s@]+@([^\s@]+\.)?(edu|ac\.[a-z]{2,}|edu\.[a-z]{2,}|college\.edu|univ\.[a-z]{2,})$/i;

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
      required: [true, 'Please provide your institutional email address'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Validates institutional email domains (.edu, .ac.*, etc.)
          return collegeEmailRegex.test(value);
        },
        message: (props) =>
          `${props.value} is not a valid college/university email address (must end with .edu, .ac.in, etc.)`,
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
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
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
