import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Seeds', 'Small Plants'] },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
