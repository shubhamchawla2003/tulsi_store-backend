import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(400); throw new Error('User already exists');
  }
  // Allow setting isAdmin via request only when explicitly enabled in env
  const allowAdmin = process.env.ALLOW_ADMIN_REGISTRATION === 'true';
  const userData = { name, email, password };
  if (allowAdmin && typeof req.body.isAdmin === 'boolean') userData.isAdmin = req.body.isAdmin;
  const user = await User.create(userData);
  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    isAdmin: user.isAdmin, token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id, name: user.name, email: user.email,
      isAdmin: user.isAdmin, token: generateToken(user._id),
    });
  } else { res.status(401); throw new Error('Invalid email or password'); }
});

export const getUserProfile = asyncHandler(async (req, res) => res.json(req.user));
