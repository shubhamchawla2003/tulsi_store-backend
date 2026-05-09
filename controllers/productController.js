import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;
  const filter = {};
  if (keyword) filter.name = { $regex: keyword, $options: 'i' };
  if (category && category !== 'All') filter.category = category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(4);
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else { res.status(404); throw new Error('Product not found'); }
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  const created = await product.save();
  res.status(201).json(created);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    Object.assign(product, req.body);
    res.json(await product.save());
  } else { res.status(404); throw new Error('Product not found'); }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else { res.status(404); throw new Error('Product not found'); }
});
