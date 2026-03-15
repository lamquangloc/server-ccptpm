import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';
import connectDB from '../config/database';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create sample categories
    const categories = await Category.insertMany([
      {
        name: 'Món chính',
        description: 'Các món ăn chính trong thực đơn',
        image: '/uploads/categories/category-sample-1.jpg'
      },
      {
        name: 'Món tráng miệng',
        description: 'Các món tráng miệng ngon miệng',
        image: '/uploads/categories/category-sample-2.jpg'
      }
    ]);

    console.log('Created categories:', categories);

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Phở bò',
        description: 'Món phở bò truyền thống với thịt bò tươi ngon',
        price: 45000,
        image: '/uploads/products/product-sample-1.jpg',
        categories: [categories[0]._id] // Món chính
      },
      {
        name: 'Bún riêu',
        description: 'Món bún riêu cua với riêu cua ngọt đậm đà',
        price: 40000,
        image: '/uploads/products/product-sample-2.jpg',
        categories: [categories[0]._id] // Món chính
      },
      {
        name: 'Chè thập cẩm',
        description: 'Món chè với nhiều loại trái cây và thạch',
        price: 25000,
        image: '/uploads/products/product-sample-3.jpg',
        categories: [categories[1]._id] // Món tráng miệng
      },
      {
        name: 'Kem trái cây',
        description: 'Kem tươi với nhiều loại trái cây tươi ngon',
        price: 30000,
        image: '/uploads/products/product-sample-4.jpg',
        categories: [categories[1]._id] // Món tráng miệng
      }
    ]);

    console.log('Created products:', products);

    // Update category productCount
    for (const category of categories) {
      const productCount = await Product.countDocuments({ categories: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }

    console.log('Updated category product counts');
    console.log('Sample data seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

export default seedData;