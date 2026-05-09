import express from 'express';
import { getProducts, getFeaturedProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').get(protect, getProducts).post(protect, admin, createProduct);
router.get('/featured', protect, getFeaturedProducts);
router.route('/:id').get(protect, getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
export default router;
