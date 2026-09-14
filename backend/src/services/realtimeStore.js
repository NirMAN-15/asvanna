/**
 * ASVANNA Real-Time Store & Telemetry Service
 * Handles dual-database real-time synchronization (MongoDB / Firebase Real-Time DB paradigm)
 * for high-frequency telemetry, live chat messaging, and over-planting risk broadcasts.
 */

const EventEmitter = require('events');

class RealtimeStore extends EventEmitter {
  constructor() {
    super();
    this.messages = [
      {
        id: 'MSG-001',
        listingId: 1,
        orderId: 1,
        senderId: 3,
        senderName: 'Bandarawela Wholesale Buyers',
        senderRole: 'BUYER',
        text: 'Hello, can you deliver 200kg Leeks by tomorrow morning?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'MSG-002',
        listingId: 1,
        orderId: 1,
        senderId: 2,
        senderName: 'Sunil Shantha (Farmer)',
        senderRole: 'FARMER',
        text: 'Yes, fresh harvest ready at my farm in Bandarawela. Rs 180 per kg is confirmed.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    this.liveMarketplaceEvents = [];
    this.telemetryFeed = [];
    console.log('⚡ ASVANNA Real-time Data Store Initialized (Dual DB Realtime Layer)');
  }

  // Record direct message between buyer and farmer
  addChatMessage(listingId, orderId, senderId, senderName, senderRole, text) {
    const msg = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      listingId: Number(listingId),
      orderId: Number(orderId),
      senderId: Number(senderId),
      senderName,
      senderRole,
      text,
      timestamp: new Date().toISOString()
    };
    this.messages.push(msg);
    this.emit('chatMessage', msg);
    return msg;
  }

  // Fetch chat history for an order or listing
  getChatHistory(orderId) {
    return this.messages.filter(m => Number(m.orderId) === Number(orderId));
  }

  // Publish real-time risk telemetry update
  publishRiskUpdate(cropCode, district, riskLevel, riskPercentage, acreage) {
    const event = {
      id: `EVT-RISK-${Date.now()}`,
      type: 'RISK_UPDATE',
      cropCode,
      district,
      riskLevel,
      riskPercentage,
      totalAcres: acreage,
      timestamp: new Date().toISOString()
    };
    this.telemetryFeed.unshift(event);
    if (this.telemetryFeed.length > 50) this.telemetryFeed.pop();
    this.emit('riskTelemetry', event);
    return event;
  }

  // Broadcast government notice in real-time
  publishBroadcastNotice(broadcastData) {
    const event = {
      id: `EVT-BROADCAST-${Date.now()}`,
      type: 'GOVT_BROADCAST',
      ...broadcastData,
      timestamp: new Date().toISOString()
    };
    this.emit('broadcastNotice', event);
    return event;
  }

  getRecentTelemetry() {
    return this.telemetryFeed;
  }
}

const realtimeStore = new RealtimeStore();
module.exports = realtimeStore;
