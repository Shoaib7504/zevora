import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'manager' | 'admin';
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

const addressSchema = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true }
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: addressSchema,
    required: false
  }
}, {
  timestamps: true
});

export const User = model<IUser>('User', userSchema);
export default User;
