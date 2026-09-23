const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const plantingRoutes = require('./routes/plantingRoutes');
const riskRoutes = require('./routes/riskRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const officerRoutes = require('./routes/officerRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const priceRoutes = require('./routes/priceRoutes');
const cropRoutes = require('./routes/cropRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const errorHandler = require('./middlewares/errorHandler');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'UP',
    service: 'ASVANNA Agricultural Intelligence Platform API',
    region: 'Bandarawela, Badulla District',
    elevation: '1,216m',
    version: '2.0.0'
  }, 'Service healthy');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/planting', plantingRoutes);
app.use('/api/v1/risk', riskRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/officer', officerRoutes);
app.use('/api/v1/broadcasts', broadcastRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/prices', priceRoutes);
app.use('/api/v1/crops', cropRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/notices', notificationRoutes);

// 404 Handler
app.use((req, res) => {
  return ApiResponse.error(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
