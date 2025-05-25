const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Purchase = require('../models/Purchase');
const Asset = require('../models/Asset');

// @desc    Get all purchases
// @route   GET /api/v1/purchases
// @access  Private
exports.getPurchases = asyncHandler(async (req, res, next) => {
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
  query = Purchase.find(JSON.parse(queryStr)).populate('equipmentType base createdBy');
  
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
    query = query.sort('-purchaseDate');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Purchase.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const purchases = await query;
  
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
    count: purchases.length,
    pagination,
    data: purchases
  });
});

// @desc    Get single purchase
// @route   GET /api/v1/purchases/:id
// @access  Private
exports.getPurchase = asyncHandler(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id).populate('equipmentType base createdBy');
  
  if (!purchase) {
    return next(new ErrorResponse(`Purchase not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this purchase's base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== purchase.base._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this purchase`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: purchase
  });
});

// @desc    Create new purchase
// @route   POST /api/v1/purchases
// @access  Private
exports.createPurchase = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Check if user has access to this base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== req.body.base) {
    return next(new ErrorResponse(`Not authorized to create purchase for this base`, 403));
  }
  
  // Create purchase
  const purchase = await Purchase.create(req.body);
  
  // Update asset quantities
  let asset = await Asset.findOne({
    equipmentType: req.body.equipmentType,
    base: req.body.base
  });
  
  if (asset) {
    // Update existing asset
    asset.quantity += req.body.quantity;
    asset.closingBalance += req.body.quantity;
    asset.lastUpdated = Date.now();
    await asset.save();
  } else {
    // Create new asset
    await Asset.create({
      equipmentType: req.body.equipmentType,
      base: req.body.base,
      quantity: req.body.quantity,
      openingBalance: 0,
      closingBalance: req.body.quantity,
      assigned: 0,
      expended: 0
    });
  }
  
  res.status(201).json({
    success: true,
    data: purchase
  });
});

// @desc    Update purchase
// @route   PUT /api/v1/purchases/:id
// @access  Private/Admin
exports.updatePurchase = asyncHandler(async (req, res, next) => {
  // Only admin can update purchases
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to update purchases`, 403));
  }
  
  let purchase = await Purchase.findById(req.params.id);
  
  if (!purchase) {
    return next(new ErrorResponse(`Purchase not found with id of ${req.params.id}`, 404));
  }
  
  // Get original quantity for asset update
  const originalQuantity = purchase.quantity;
  
  // Update purchase
  purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Update asset quantities if quantity changed
  if (originalQuantity !== req.body.quantity) {
    const asset = await Asset.findOne({
      equipmentType: purchase.equipmentType,
      base: purchase.base
    });
    
    if (asset) {
      // Update asset quantity and closing balance
      const quantityDifference = req.body.quantity - originalQuantity;
      asset.quantity += quantityDifference;
      asset.closingBalance += quantityDifference;
      asset.lastUpdated = Date.now();
      await asset.save();
    }
  }
  
  res.status(200).json({
    success: true,
    data: purchase
  });
});

// @desc    Delete purchase
// @route   DELETE /api/v1/purchases/:id
// @access  Private/Admin
exports.deletePurchase = asyncHandler(async (req, res, next) => {
  // Only admin can delete purchases
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to delete purchases`, 403));
  }
  
  const purchase = await Purchase.findById(req.params.id);
  
  if (!purchase) {
    return next(new ErrorResponse(`Purchase not found with id of ${req.params.id}`, 404));
  }
  
  // Update asset quantities
  const asset = await Asset.findOne({
    equipmentType: purchase.equipmentType,
    base: purchase.base
  });
  
  if (asset) {
    // Update asset quantity and closing balance
    asset.quantity -= purchase.quantity;
    asset.closingBalance -= purchase.quantity;
    asset.lastUpdated = Date.now();
    await asset.save();
  }
  
  await purchase.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
