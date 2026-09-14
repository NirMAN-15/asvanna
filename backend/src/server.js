const app = require('./app');
const config = require('./config/config');
const { initScheduler } = require('./jobs/scheduler');

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🌾 ASVANNA Agricultural Intelligence Platform v2.0`);
  console.log(`📍 Pilot Deployment: Bandarawela, Uva Province`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🚀 Listening on Port: http://localhost:${config.port}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/health`);
  console.log(`=======================================================`);

  // Start background cron jobs if enabled
  if (config.scheduler.enabled) {
    initScheduler();
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
