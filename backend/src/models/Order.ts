import { Schema, model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IOrder {
  userEmail: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  category: { type: String, default: '' },
}, { _id: false });

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0, default: 5.99 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  notes: { type: String, trim: true },
}, {
  timestamps: true,
  collection: 'orders',
});

export const Order = model<IOrder>('Order', orderSchema);
export default Order;
