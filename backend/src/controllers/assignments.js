const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Private
exports.getAssignments = asyncHandler(async (req, res, next) => {
  let query;
  
  // Copy req.query
  const reqQuery = { ...req.query };
  
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource
  query = Assignment.find(JSON.parse(queryStr)).populate('equipmentType base createdBy');
  
  // Base access control
  if (req.user.role !== 'admin') {
    query = query.where('base').equals(req.user.assignedBase);
  }
  
  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-assignmentDate');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Assignment.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const assignments = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: assignments.length,
    pagination,
    data: assignments
  });
});

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate('equipmentType base createdBy');
  
  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this assignment's base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== assignment.base._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this assignment`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create new assignment
// @route   POST /api/v1/assignments
// @access  Private
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Check if user has access to this base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== req.body.base) {
    return next(new ErrorResponse(`Not authorized to create assignment for this base`, 403));
  }
  
  // Check if base has enough assets
  const asset = await Asset.findOne({
    equipmentType: req.body.equipmentType,
    base: req.body.base
  });
  
  if (!asset || asset.quantity < req.body.quantity) {
    return next(new ErrorResponse(`Not enough assets available for assignment`, 400));
  }
  
  // Create assignment
  const assignment = await Assignment.create(req.body);
  
  // Update asset quantities
  asset.quantity -= req.body.quantity;
  asset.assigned += req.body.quantity;
  asset.lastUpdated = Date.now();
  await asset.save();
  
  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment status
// @route   PUT /api/v1/assignments/:id
// @access  Private
exports.updateAssignmentStatus = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this assignment
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== assignment.base.toString()) {
    return next(new ErrorResponse(`Not authorized to update this assignment`, 403));
  }
  
  // Only allow status updates
  if (!req.body.status) {
    return next(new ErrorResponse(`Please provide a status update`, 400));
  }
  
  // Get asset for quantity updates
  const asset = await Asset.findOne({
    equipmentType: assignment.equipmentType,
    base: assignment.base
  });
  
  if (!asset) {
    return next(new ErrorResponse(`Asset not found for this assignment`, 404));
  }
  
  // Handle status change
  if (req.body.status === 'returned' && assignment.status === 'assigned') {
    // Return assets to inventory
    asset.quantity += assignment.quantity;
    asset.assigned -= assignment.quantity;
  } else if (req.body.status === 'expended' && assignment.status === 'assigned') {
    // Mark assets as expended
    asset.assigned -= assignment.quantity;
    asset.expended += assignment.quantity;
  }
  
  // Update asset
  asset.lastUpdated = Date.now();
  await asset.save();
  
  // Update assignment
  assignment = await Assignment.findByIdAndUpdate(
    req.params.id, 
    { 
      status: req.body.status,
      returnDate: req.body.status === 'returned' ? Date.now() : assignment.returnDate
    }, 
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private/Admin
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  // Only admin can delete assignments
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to delete assignments`, 403));
  }
  
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }
  
  // Only allow deletion of assigned status
  if (assignment.status !== 'assigned') {
    return next(new ErrorResponse(`Cannot delete assignments that are not in assigned status`, 400));
  }
  
  // Update asset quantities
  const asset = await Asset.findOne({
    equipmentType: assignment.equipmentType,
    base: assignment.base
  });
  
  if (asset) {
    asset.quantity += assignment.quantity;
    asset.assigned -= assignment.quantity;
    asset.lastUpdated = Date.now();
    await asset.save();
  }
  
  await assignment.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
