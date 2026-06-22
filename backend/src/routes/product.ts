import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product';

const router = Router();

// GET /products - Get all products with filters, sorting, and pagination
router.get('/', getProducts);

// GET /products/:id - Get single product by ID
router.get('/:id', getProductById);

// POST /products - Create a new product
router.post('/', createProduct);

// PUT /products/:id - Update an existing product
router.put('/:id', updateProduct);

// DELETE /products/:id - Delete a product by ID
router.delete('/:id', deleteProduct);

export default router;
