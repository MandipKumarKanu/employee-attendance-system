const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@eas.local',
      password: 'Admin@123',
      role: 'admin',
      employeeId: 'EMP-0001',
    });

    console.log('Default admin created:');
    console.log(`  Email: admin@eas.local`);
    console.log(`  Password: Admin@123`);
    console.log(`  Employee ID: ${admin.employeeId}`);
    console.log('\nPlease change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
