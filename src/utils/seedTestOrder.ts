import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import User from '../models/User';
import Table from '../models/Table';
import Product from '../models/Product';
import Order from '../models/Order';

dotenv.config();

const seedTestOrder = async () => {
  try {
    await connectDB();

    // 1. Create/Find Test User
    let user = await User.findOne({ email: 'testuser@example.com' });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'user',
        phone: '0123456789'
      });
      await user.save();
      console.log('Test User created: testuser@example.com / password123');
    } else {
      console.log('Test User already exists');
    }

    // 2. Create/Find Test Table
    let table = await Table.findOne({ number: 1 });
    if (!table) {
      table = new Table({
        number: 1,
        capacity: 4,
        status: 'available'
      });
      await table.save();
      console.log('Test Table created: Bàn số 1');
    }

    // 3. Find some products (assume seedData.ts was run)
    const products = await Product.find().limit(2);
    if (products.length === 0) {
      console.error('No products found. Please run npm run seed first.');
      process.exit(1);
    }

    // 4. Create Test Order
    const order = new Order({
      user: user._id,
      table: table._id,
      products: products.map(p => ({
        product: p._id,
        quantity: 2
      })),
      total: products.reduce((acc, p) => acc + p.price * 2, 0),
      status: 'pending'
    });

    await order.save();
    console.log('Test Order created for testuser@example.com');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test order:', error);
    process.exit(1);
  }
};

seedTestOrder();
