const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  equipmentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentType',
    required: true
  },
  fromBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  toBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  transferDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  transferOrder: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Transfer', TransferSchema);
