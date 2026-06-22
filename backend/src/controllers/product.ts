import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models';

/**
 * GET /products
 * Get all products with pagination, filtering, and sorting
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Filter by exact category
    if (req.query.category) {
      filter.category = req.query.category as string;
    }

    // Search by name or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    // Filter by rating average threshold
    if (req.query.rating) {
      filter['ratings.average'] = { $gte: parseFloat(req.query.rating as string) };
    }

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: true, error: error.message });
  }
}

/**
 * GET /products/:id
 * Get a single product by ID
 */
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /products
 * Create a new product
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, price, category, stock, images, ratings, seller } = req.body;

    if (!name || !description || price === undefined || !category || !seller) {
      res.status(400).json({ success: false, message: 'Required fields are missing' });
      return;
    }

    if (typeof seller !== 'string' || !Types.ObjectId.isValid(seller)) {
      res.status(400).json({ success: false, message: 'Invalid seller ID format' });
      return;
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      ratings,
      seller
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /products/:id
 * Update an existing product
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    // Prevent changing the seller ID
    if (req.body.seller) {
      delete req.body.seller;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /products/:id
 * Delete a product by ID
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
