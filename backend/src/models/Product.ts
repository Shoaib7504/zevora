import { Schema, model, Types } from 'mongoose';

/**
 * IProduct — core required fields matching the schema.
 * Because strict: false is set on the schema, ANY additional fields stored
 * in your MongoDB "Products" collection will also be returned by queries.
 */
export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  ratings: {
    average: number;
    count: number;
  };
  seller?: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, min: 0 },
    category: { type: String, trim: true },
    stock: { type: Number, min: 0, default: 0 },
    images: { type: [String], default: [] },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  {
    timestamps: true,

    /**
     * Points Mongoose to the EXACT collection in your "Zevora-e-commerce" database.
     * MongoDB collection names are case-sensitive — "Products" with capital P.
     */
    collection: 'Products',

    /**
     * strict: false — Mongoose will include ALL fields stored in each document,
     * even ones not listed in the schema above.
     * This ensures every custom field you put in your Products collection is returned.
     */
    strict: false,
  }
);

export const Product = model<IProduct>('Product', productSchema);
export default Product;
