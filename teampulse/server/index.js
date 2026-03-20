// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const eodRoutes  = require('./routes/eod');
// const adminRoutes = require('./routes/admin');

// const app = express();

// // ── Middleware ──
// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(express.json());

// // ── Routes ──
// app.use('/api/auth',  authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/eod',   eodRoutes);
// app.use('/api/admin', adminRoutes);

// // ── Health check ──
// app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TeamPulse API running' }));

// // ── Global error handler ──
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Internal Server Error', error: err.message });
// });

// // ── DB + Start ──
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     app.listen(process.env.PORT, () =>
//       console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
//     );
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection failed:', err.message);
//     process.exit(1);
//   });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eodRoutes  = require('./routes/eod');
const adminRoutes = require('./routes/admin');

const app = express();

// ── CORS FIX (IMPORTANT) ──
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://teampulse-client.onrender.com"
  ],
  credentials: true
}));

// ── Middleware ──
app.use(express.json());

// ── Routes ──
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eod',   eodRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TeamPulse API running 🚀' });
});

// ── Root route (optional but helpful) ──
app.get('/', (req, res) => {
  res.send('TeamPulse Backend Running ✅');
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
});

// ── DB + Start ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });