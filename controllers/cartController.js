import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('user', 'name email');
  res.json(cart || { items: [] });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) {
    existing.quantity += safeQuantity;
    existing.addedBy = req.user._id;
    existing.addedAt = new Date();
  }
  else cart.items.push({
    product: product._id, name: product.name, image: product.image,
    price: product.price, quantity: safeQuantity,
    addedBy: req.user._id,
  });
  await cart.save();
  res.status(201).json(cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const safeQuantity = Number(quantity);
  if (!Number.isFinite(safeQuantity)) {
    res.status(400);
    throw new Error('Invalid quantity');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  if (safeQuantity <= 0) {
    cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
  } else {
    item.quantity = safeQuantity;
  }

  await cart.save();
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } else { res.status(404); throw new Error('Cart not found'); }
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = []; await cart.save(); }
  res.json({ message: 'Cart cleared' });
});
