const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
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
    min: 1
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  purchaseOrder: {
    type: String,
    required: true
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

module.exports = mongoose.model('Purchase', PurchaseSchema);
