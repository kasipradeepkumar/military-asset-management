const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const EquipmentType = require('../models/EquipmentType');

// @desc    Get all equipment types
// @route   GET /api/v1/equipment-types
// @access  Private
exports.getEquipmentTypes = asyncHandler(async (req, res, next) => {
  const equipmentTypes = await EquipmentType.find();
  
  res.status(200).json({
    success: true,
    count: equipmentTypes.length,
    data: equipmentTypes
  });
});

// @desc    Get single equipment type
// @route   GET /api/v1/equipment-types/:id
// @access  Private
exports.getEquipmentType = asyncHandler(async (req, res, next) => {
  const equipmentType = await EquipmentType.findById(req.params.id);
  
  if (!equipmentType) {
    return next(new ErrorResponse(`Equipment type not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: equipmentType
  });
});

// @desc    Create new equipment type
// @route   POST /api/v1/equipment-types
// @access  Private/Admin
exports.createEquipmentType = asyncHandler(async (req, res, next) => {
  // Only admin can create equipment types
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to create equipment types`, 403));
  }
  
  const equipmentType = await EquipmentType.create(req.body);
  
  res.status(201).json({
    success: true,
    data: equipmentType
  });
});

// @desc    Update equipment type
// @route   PUT /api/v1/equipment-types/:id
// @access  Private/Admin
exports.updateEquipmentType = asyncHandler(async (req, res, next) => {
  // Only admin can update equipment types
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to update equipment types`, 403));
  }
  
  let equipmentType = await EquipmentType.findById(req.params.id);
  
  if (!equipmentType) {
    return next(new ErrorResponse(`Equipment type not found with id of ${req.params.id}`, 404));
  }
  
  equipmentType = await EquipmentType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: equipmentType
  });
});

// @desc    Delete equipment type
// @route   DELETE /api/v1/equipment-types/:id
// @access  Private/Admin
exports.deleteEquipmentType = asyncHandler(async (req, res, next) => {
  // Only admin can delete equipment types
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to delete equipment types`, 403));
  }
  
  const equipmentType = await EquipmentType.findById(req.params.id);
  
  if (!equipmentType) {
    return next(new ErrorResponse(`Equipment type not found with id of ${req.params.id}`, 404));
  }
  
  await equipmentType.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
