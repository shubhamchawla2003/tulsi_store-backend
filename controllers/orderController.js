import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Lazy initialize Razorpay to handle missing keys gracefully
let razorpay = null;

const initializeRazorpay = () => {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret || key_id.includes('your_') || key_secret.includes('your_')) {
      console.warn('⚠️ Razorpay keys are not properly configured. Payment functionality will be limited.');
      return null;
    }
    
    razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });
  }
  return razorpay;
};

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0) {
    res.status(400); throw new Error('No order items');
  }
  
  const razorpayInstance = initializeRazorpay();
  if (!razorpayInstance) {
    res.status(503); throw new Error('Payment service is not configured. Please contact support.');
  }
  
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: Math.round(totalPrice * 100),
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });
  const order = new Order({
    user: req.user._id, orderItems, shippingAddress, totalPrice,
    paymentResult: { razorpay_order_id: razorpayOrder.id },
  });
  const created = await order.save();
  res.status(201).json({
    order: created,
    razorpayOrderId: razorpayOrder.id,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (generated !== razorpay_signature) {
    res.status(400); throw new Error('Invalid payment signature');
  }
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { razorpay_order_id, razorpay_payment_id, razorpay_signature };
    res.json(await order.save());
  } else { res.status(404); throw new Error('Order not found'); }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});
