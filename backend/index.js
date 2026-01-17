import rfpRoutes from './routes/rfp.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import emailRoutes from './routes/email.routes.js';
import comparisonRoutes from './routes/comparison.routes.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/comparison', comparisonRoutes);

// MongoDB connection
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('📦 DB:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('💡 TIP: Check your MongoDB Atlas IP Whitelist (Network Access)');
  });

app.get('/', (req, res) => {
  res.send('AI RFP Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
