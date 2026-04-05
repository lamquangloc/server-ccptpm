import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Category from '../models/Category';
import Table from '../models/Table';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [userCount, productCount, orderCount, categoryCount, completedOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.find({ status: 'complete' }).populate('user', 'name avatar')
    ]);

    // Calculate total revenue from all completed orders
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate revenue this month vs previous month for changes
    const ordersThisMonth = await Order.find({ status: 'complete', createdAt: { $gte: firstDayOfMonth } });
    const ordersPrevMonth = await Order.find({ status: 'complete', createdAt: { $gte: firstDayOfPrevMonth, $lt: firstDayOfMonth } });
    
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenuePrevMonth = ordersPrevMonth.reduce((sum, o) => sum + (o.total || 0), 0);
    
    let revenueChange = '0';
    if (revenuePrevMonth > 0) {
      revenueChange = ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth * 100).toFixed(1);
    } else if (revenueThisMonth > 0) {
      revenueChange = '100'; // If no revenue last month but some this month, it's 100% growth
    }

    // 1. Staff Performance
    const userSales = completedOrders.reduce((acc, order) => {
      if (order.user) {
        const uid = (order.user as any)?._id?.toString() || 'unknown';
        if (!acc[uid]) {
          acc[uid] = { 
            name: (order.user as any)?.name || 'Unknown', 
            tables: 0, 
            sales: 0, 
            avatar: (order.user as any)?.name || 'default'
          };
        }
        acc[uid].tables += 1;
        acc[uid].sales += order.total || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    const staffData = Object.values(userSales).map(s => ({
      name: s.name,
      tables: s.tables,
      sales: `$${s.sales.toLocaleString()}`,
      avatar: s.avatar
    }));

    // 2. Available Tables (Real data from Table model)
    const availableTablesFromDB = await Table.find({ status: 'available' }).sort({ number: 1 });
    const availableTables = availableTablesFromDB.map(t => ({
      name: `Table ${t.number}`,
      status: 'available',
      statusText: `Available (Cap: ${t.capacity})`,
      emoji: '🪑',
      color: 'text-green-500'
    }));

    // 3. Stat Cards
    const statCards = [
      {
        label: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: `${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
        positive: parseFloat(revenueChange) >= 0,
        iconBg: 'bg-green-50',
        id: 'revenue'
      },
      {
        label: 'Total Orders',
        value: `${orderCount}`,
        change: 'Real',
        positive: true,
        iconBg: 'bg-blue-50',
        id: 'orders'
      },
      {
        label: 'Total Products',
        value: `${productCount}`,
        change: `Total`,
        positive: true,
        iconBg: 'bg-orange-50',
        id: 'products'
      },
      {
        label: 'Staff Count',
        value: `${userCount}`,
        change: 'Online',
        positive: true,
        iconBg: 'bg-purple-50',
        id: 'staff'
      },
    ];

    // 4. Peak Hours Data
    const hours = ['11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm'];
    const hourMapping: any = {
      11: '11am', 12: '12pm', 13: '1pm', 14: '2pm', 15: '3pm', 16: '4pm', 17: '5pm', 18: '6pm', 19: '7pm', 20: '8pm', 21: '9pm', 22: '10pm'
    };

    const peakHoursData = hours.map(h => ({ hour: h, today: 0, yesterday: 0 }));
    
    const ordersToday = await Order.find({ createdAt: { $gte: today } });
    const ordersYesterday = await Order.find({ createdAt: { $gte: yesterday, $lt: today } });

    ordersToday.forEach(o => {
      const h = o.createdAt.getHours();
      const hLabel = hourMapping[h];
      const entry = peakHoursData.find(d => d.hour === hLabel);
      if (entry) entry.today++;
    });

    ordersYesterday.forEach(o => {
      const h = o.createdAt.getHours();
      const hLabel = hourMapping[h];
      const entry = peakHoursData.find(d => d.hour === hLabel);
      if (entry) entry.yesterday++;
    });

    // 5. Donut Slices (Sales by Category)
    const categorySales = await Order.aggregate([
      { $match: { status: 'complete' } },
      { $unwind: '$products' },
      { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'productDetails' } },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      // Use an 'Other' ObjectID as fallback for categories
      { $addFields: { 
          categoryIds: { 
            $cond: {
              if: { $or: [{ $eq: ["$productDetails", null] }, { $not: ["$productDetails.categories"] }, { $eq: [{ $size: { $ifNull: ["$productDetails.categories", []] } }, 0] }] },
              then: [null], // We'll handle null as 'Other'
              else: "$productDetails.categories"
            }
          } 
      } },
      { $unwind: '$categoryIds' },
      { $group: { 
          _id: '$categoryIds', 
          totalSales: { $sum: { $ifNull: ['$productDetails.price', 0] } } // Approximation, or better: use a fraction of order total if possible
      } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$categoryDetails.name', 'Other'] }, totalSales: 1 } },
      { $match: { totalSales: { $gt: 0 } } }
    ]);

    const totalCategorySales = categorySales.reduce((sum, c) => sum + c.totalSales, 0);
    let donutSlices = categorySales.map((c, i) => {
        const colors = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
        return {
            label: c.name,
            pct: totalCategorySales > 0 ? Math.round((c.totalSales / totalCategorySales) * 100) : 0,
            color: colors[i % colors.length]
        };
    });

    // If still empty but we have revenue, show one big 'Other' slice
    if (donutSlices.length === 0 && totalRevenue > 0) {
      donutSlices = [{ label: 'Other', pct: 100, color: '#1e293b' }];
    }

    res.json({
      statCards,
      staffData,
      availableTables,
      peakHoursData,
      donutSlices,
      totalRevenue
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};