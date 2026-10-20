import mongoose from 'mongoose';

export const CATEGORIES = [
  'Books',
  'Lab Equipment',
  'Electronics',
  'Stationery',
  'Clothing',
  'Bags & Accessories',
  'Furniture',
  'Other',
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const STATUSES = ['AVAILABLE', 'SOLD'];

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a listing title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price (set 0 for free/donation)'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category',
      },
    },
    condition: {
      type: String,
      required: [true, 'Please specify the item condition'],
      enum: {
        values: CONDITIONS,
        message: '{VALUE} is not a valid condition (Choose: New, Like New, Good, Fair)',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL for the listing'],
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Listing must be associated with a seller'],
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: '{VALUE} is not a valid status (Choose: AVAILABLE, SOLD)',
      },
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for feed filtering and user dashboard queries
listingSchema.index({ status: 1, category: 1, createdAt: -1 });
listingSchema.index({ seller: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text' });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
