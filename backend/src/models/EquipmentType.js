const mongoose = require('mongoose');

const EquipmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['weapon', 'vehicle', 'ammunition', 'other'],
    required: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EquipmentType', EquipmentTypeSchema);
