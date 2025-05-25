const mongoose = require('mongoose');

const TransactionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['purchase', 'transfer', 'assignment', 'expenditure', 'login', 'logout', 'update'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TransactionLog', TransactionLogSchema);
