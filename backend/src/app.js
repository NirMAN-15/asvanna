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

// Health Check Endpoints
app.get(['/health', '/api/health', '/api/v1/health', '/v1/health'], (req, res) => {
  return ApiResponse.success(res, {
    status: 'UP',
    service: 'ASVANNA Agricultural Intelligence Platform API',
    region: 'Bandarawela, Badulla District',
    elevation: '1,216m',
    version: '2.0.0'
  }, 'Service healthy');
});

// API Routes (Mounted on both /api/v1 and /v1 for seamless Nginx reverse-proxy compatibility)
['/api/v1', '/v1'].forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/planting`, plantingRoutes);
  app.use(`${prefix}/risk`, riskRoutes);
  app.use(`${prefix}/recommendations`, recommendationRoutes);
  app.use(`${prefix}/marketplace`, marketplaceRoutes);
  app.use(`${prefix}/officer`, officerRoutes);
  app.use(`${prefix}/broadcasts`, broadcastRoutes);
  app.use(`${prefix}/weather`, weatherRoutes);
  app.use(`${prefix}/prices`, priceRoutes);
  app.use(`${prefix}/crops`, cropRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/notices`, notificationRoutes);
});

// 404 Handler
app.use((req, res) => {
  return ApiResponse.error(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;