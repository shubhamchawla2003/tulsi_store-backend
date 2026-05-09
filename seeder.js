import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import products from './data/products.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await User.create({
      name: 'Admin', email: 'admin@tulsi.com',
      password: 'admin123', isAdmin: true,
    });
    await Product.insertMany(products);
    console.log('‚úÖ Data Imported! Admin: admin@tulsi.com / admin123');
    process.exit();
  } catch (error) { console.error(`‚ùå ${error}`); process.exit(1); }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Ì∑ëÔ∏è Data Destroyed!');
    process.exit();
  } catch (error) { console.error(`‚ùå ${error}`); process.exit(1); }
};

if (process.argv[2] === '-d') destroyData();
else importData();
