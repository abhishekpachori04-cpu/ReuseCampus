import mongoose from 'mongoose';

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
        values: [
          'Textbooks & Notes',
          'Electronics & Gadgets',
          'Dorm Essentials',
          'Furniture',
          'Bicycles & Transport',
          'Lab & Sports Gear',
          'Clothing & Accessories',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
    },
    condition: {
      type: String,
      required: [true, 'Please specify the item condition'],
      enum: {
        values: ['New', 'Like New', 'Good', 'Fair'],
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
      enum: ['AVAILABLE', 'SOLD'],
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize searching and sorting
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ seller: 1, createdAt: -1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
