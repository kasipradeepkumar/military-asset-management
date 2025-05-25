const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Base = require('../models/Base');

// @desc    Get all bases
// @route   GET /api/v1/bases
// @access  Private
exports.getBases = asyncHandler(async (req, res, next) => {
  // For base commanders and logistics officers, only return their assigned base
  if (req.user.role === 'base_commander' || req.user.role === 'logistics_officer') {
    const base = await Base.findById(req.user.assignedBase);
    
    return res.status(200).json({
      success: true,
      count: base ? 1 : 0,
      data: base ? [base] : []
    });
  }
  
  // For admins, return all bases
  const bases = await Base.find();
  
  res.status(200).json({
    success: true,
    count: bases.length,
    data: bases
  });
});

// @desc    Get single base
// @route   GET /api/v1/bases/:id
// @access  Private
exports.getBase = asyncHandler(async (req, res, next) => {
  const base = await Base.findById(req.params.id);
  
  if (!base) {
    return next(new ErrorResponse(`Base not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== req.params.id) {
    return next(new ErrorResponse(`Not authorized to access this base`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: base
  });
});

// @desc    Create new base
// @route   POST /api/v1/bases
// @access  Private/Admin
exports.createBase = asyncHandler(async (req, res, next) => {
  // Only admin can create bases
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to create bases`, 403));
  }
  
  const base = await Base.create(req.body);
  
  res.status(201).json({
    success: true,
    data: base
  });
});

// @desc    Update base
// @route   PUT /api/v1/bases/:id
// @access  Private/Admin
exports.updateBase = asyncHandler(async (req, res, next) => {
  // Only admin can update bases
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to update bases`, 403));
  }
  
  let base = await Base.findById(req.params.id);
  
  if (!base) {
    return next(new ErrorResponse(`Base not found with id of ${req.params.id}`, 404));
  }
  
  base = await Base.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: base
  });
});

// @desc    Delete base
// @route   DELETE /api/v1/bases/:id
// @access  Private/Admin
exports.deleteBase = asyncHandler(async (req, res, next) => {
  // Only admin can delete bases
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to delete bases`, 403));
  }
  
  const base = await Base.findById(req.params.id);
  
  if (!base) {
    return next(new ErrorResponse(`Base not found with id of ${req.params.id}`, 404));
  }
  
  await base.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
