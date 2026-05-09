import express from 'express';
import { createOrder, verifyPayment, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, createOrder);
router.post('/:id/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
export default router;
