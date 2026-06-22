import { Schema, model, Types } from 'mongoose';

export interface IReview {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Ensure a user can only review a product once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
export default Review;
