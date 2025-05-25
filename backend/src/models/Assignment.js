const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
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
  assignedTo: {
    type: String,
    required: true
  },
  assignmentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['assigned', 'returned', 'expended'],
    default: 'assigned'
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

module.exports = mongoose.model('Assignment', AssignmentSchema);
