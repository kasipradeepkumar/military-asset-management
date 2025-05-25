const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');

// @desc    Get all transfers
// @route   GET /api/v1/transfers
// @access  Private
exports.getTransfers = asyncHandler(async (req, res, next) => {
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
  query = Transfer.find(JSON.parse(queryStr)).populate('equipmentType fromBase toBase createdBy');
  
  // Base access control
  if (req.user.role !== 'admin') {
    query = query.or([
      { fromBase: req.user.assignedBase },
      { toBase: req.user.assignedBase }
    ]);
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
    query = query.sort('-transferDate');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Transfer.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const transfers = await query;
  
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
    count: transfers.length,
    pagination,
    data: transfers
  });
});

// @desc    Get single transfer
// @route   GET /api/v1/transfers/:id
// @access  Private
exports.getTransfer = asyncHandler(async (req, res, next) => {
  const transfer = await Transfer.findById(req.params.id).populate('equipmentType fromBase toBase createdBy');
  
  if (!transfer) {
    return next(new ErrorResponse(`Transfer not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this transfer
  if (req.user.role !== 'admin' && 
      req.user.assignedBase.toString() !== transfer.fromBase._id.toString() && 
      req.user.assignedBase.toString() !== transfer.toBase._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this transfer`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: transfer
  });
});

// @desc    Create new transfer
// @route   POST /api/v1/transfers
// @access  Private
exports.createTransfer = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Check if user has access to the fromBase
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== req.body.fromBase) {
    return next(new ErrorResponse(`Not authorized to create transfer from this base`, 403));
  }
  
  // Check if fromBase and toBase are different
  if (req.body.fromBase === req.body.toBase) {
    return next(new ErrorResponse(`Cannot transfer to the same base`, 400));
  }
  
  // Check if source base has enough assets
  const sourceAsset = await Asset.findOne({
    equipmentType: req.body.equipmentType,
    base: req.body.fromBase
  });
  
  if (!sourceAsset || sourceAsset.quantity < req.body.quantity) {
    return next(new ErrorResponse(`Not enough assets available for transfer`, 400));
  }
  
  // Create transfer
  const transfer = await Transfer.create(req.body);
  
  // Update source asset quantities
  sourceAsset.quantity -= req.body.quantity;
  sourceAsset.closingBalance -= req.body.quantity;
  sourceAsset.lastUpdated = Date.now();
  await sourceAsset.save();
  
  // Update or create destination asset
  let destAsset = await Asset.findOne({
    equipmentType: req.body.equipmentType,
    base: req.body.toBase
  });
  
  if (destAsset) {
    // Update existing asset
    destAsset.quantity += req.body.quantity;
    destAsset.closingBalance += req.body.quantity;
    destAsset.lastUpdated = Date.now();
    await destAsset.save();
  } else {
    // Create new asset
    await Asset.create({
      equipmentType: req.body.equipmentType,
      base: req.body.toBase,
      quantity: req.body.quantity,
      openingBalance: 0,
      closingBalance: req.body.quantity,
      assigned: 0,
      expended: 0
    });
  }
  
  res.status(201).json({
    success: true,
    data: transfer
  });
});

// @desc    Update transfer status
// @route   PUT /api/v1/transfers/:id
// @access  Private
exports.updateTransferStatus = asyncHandler(async (req, res, next) => {
  let transfer = await Transfer.findById(req.params.id);
  
  if (!transfer) {
    return next(new ErrorResponse(`Transfer not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this transfer
  if (req.user.role !== 'admin' && 
      req.user.assignedBase.toString() !== transfer.fromBase.toString() && 
      req.user.assignedBase.toString() !== transfer.toBase.toString()) {
    return next(new ErrorResponse(`Not authorized to update this transfer`, 403));
  }
  
  // Only allow status updates
  if (!req.body.status) {
    return next(new ErrorResponse(`Please provide a status update`, 400));
  }
  
  // Update transfer
  transfer = await Transfer.findByIdAndUpdate(
    req.params.id, 
    { status: req.body.status }, 
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: transfer
  });
});

// @desc    Delete transfer
// @route   DELETE /api/v1/transfers/:id
// @access  Private/Admin
exports.deleteTransfer = asyncHandler(async (req, res, next) => {
  // Only admin can delete transfers
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to delete transfers`, 403));
  }
  
  const transfer = await Transfer.findById(req.params.id);
  
  if (!transfer) {
    return next(new ErrorResponse(`Transfer not found with id of ${req.params.id}`, 404));
  }
  
  // Only allow deletion of pending transfers
  if (transfer.status !== 'pending') {
    return next(new ErrorResponse(`Cannot delete transfers that are not in pending status`, 400));
  }
  
  // Revert source asset quantities
  const sourceAsset = await Asset.findOne({
    equipmentType: transfer.equipmentType,
    base: transfer.fromBase
  });
  
  if (sourceAsset) {
    sourceAsset.quantity += transfer.quantity;
    sourceAsset.closingBalance += transfer.quantity;
    sourceAsset.lastUpdated = Date.now();
    await sourceAsset.save();
  }
  
  // Revert destination asset quantities
  const destAsset = await Asset.findOne({
    equipmentType: transfer.equipmentType,
    base: transfer.toBase
  });
  
  if (destAsset) {
    destAsset.quantity -= transfer.quantity;
    destAsset.closingBalance -= transfer.quantity;
    destAsset.lastUpdated = Date.now();
    await destAsset.save();
  }
  
  await transfer.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
