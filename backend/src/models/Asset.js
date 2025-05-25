const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  equipmentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentType',
    required: true
  },
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  openingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  closingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  assigned: {
    type: Number,
    default: 0,
    min: 0
  },
  expended: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Asset', AssetSchema);
