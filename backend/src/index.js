// Update CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://military-asset-management.netlify.app', 'https://military-asset-management.vercel.app'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const { logTransaction } = require('./middleware/logger');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './src/config/.env' });

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const bases = require('./routes/bases');
const equipmentTypes = require('./routes/equipmentTypes');
const assets = require('./routes/assets');
const purchases = require('./routes/purchases');
const transfers = require('./routes/transfers');
const assignments = require('./routes/assignments');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS with options
app.use(cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Transaction logging middleware
app.use(logTransaction);

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/bases', bases);
app.use('/api/v1/equipment-types', equipmentTypes);
app.use('/api/v1/assets', assets);
app.use('/api/v1/purchases', purchases);
app.use('/api/v1/transfers', transfers);
app.use('/api/v1/assignments', assignments);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
