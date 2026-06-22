import { Schema, model, Types } from 'mongoose';

export interface IFavorite {
  user: Types.ObjectId;
  product: Types.ObjectId;
}

const favoriteSchema = new Schema<IFavorite>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  }
}, {
  timestamps: true
});

// Prevent users from favoriting the same product multiple times
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
export default Favorite;
