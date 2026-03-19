const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({
    $or: [{ username: 'admin' }, { email: 'admin@gmail.com' }]
  });

  if (existing) {
    existing.isAdmin  = true;
    existing.isActive = true;
    existing.email    = 'admin@gmail.com';
    await existing.save();
    console.log('✅ Admin promoted:', existing.name);
  } else {
    await User.create({
      name:     'Admin User',
      username: 'admin',
      email:    'admin@gmail.com',
      password: 'admin123',
      role:     'Administrator',
      color:    '#1F3A63',
      isAdmin:  true,
      isActive: true,
    });
    console.log('✅ Admin created successfully');
  }

  console.log('─────────────────────────────');
  console.log('  Email   : admin@gmail.com');
  console.log('  Password: admin123');
  console.log('─────────────────────────────');

  mongoose.disconnect();
};

seed().catch(console.error);