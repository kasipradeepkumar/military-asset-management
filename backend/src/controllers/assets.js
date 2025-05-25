const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Asset = require('../models/Asset');
const Purchase = require('../models/Purchase');
const Transfer = require('../models/Transfer');
const Assignment = require('../models/Assignment');

// @desc    Get all assets
// @route   GET /api/v1/assets
// @access  Private
exports.getAssets = asyncHandler(async (req, res, next) => {
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
  query = Asset.find(JSON.parse(queryStr)).populate('equipmentType base');
  
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
    query = query.sort('-lastUpdated');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Asset.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const assets = await query;
  
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
    count: assets.length,
    pagination,
    data: assets
  });
});

// @desc    Get single asset
// @route   GET /api/v1/assets/:id
// @access  Private
exports.getAsset = asyncHandler(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id).populate('equipmentType base');
  
  if (!asset) {
    return next(new ErrorResponse(`Asset not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this asset's base
  if (req.user.role !== 'admin' && req.user.assignedBase.toString() !== asset.base._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this asset`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: asset
  });
});

// @desc    Get dashboard metrics
// @route   GET /api/v1/assets/dashboard
// @access  Private
exports.getDashboardMetrics = asyncHandler(async (req, res, next) => {
  const { baseId, equipmentTypeId, startDate, endDate } = req.query;
  
  // Base filter
  let baseFilter = {};
  if (baseId) {
    baseFilter = { base: baseId };
  } else if (req.user.role !== 'admin') {
    baseFilter = { base: req.user.assignedBase };
  }
  
  // Equipment type filter
  let equipmentTypeFilter = {};
  if (equipmentTypeId) {
    equipmentTypeFilter = { equipmentType: equipmentTypeId };
  }
  
  // Date filter
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      $and: [
        { lastUpdated: { $gte: new Date(startDate) } },
        { lastUpdated: { $lte: new Date(endDate) } }
      ]
    };
  }
  
  // Combine filters
  const filter = {
    ...baseFilter,
    ...equipmentTypeFilter,
    ...dateFilter
  };
  
  // Get assets
  const assets = await Asset.find(filter).populate('equipmentType base');
  
  // Calculate metrics
  let openingBalance = 0;
  let closingBalance = 0;
  let assigned = 0;
  let expended = 0;
  
  assets.forEach(asset => {
    openingBalance += asset.openingBalance;
    closingBalance += asset.closingBalance;
    assigned += asset.assigned;
    expended += asset.expended;
  });
  
  // Get purchases
  const purchases = await Purchase.find({
    ...baseFilter,
    ...equipmentTypeFilter,
    ...(startDate && endDate ? {
      purchaseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } : {})
  });
  
  let totalPurchases = 0;
  purchases.forEach(purchase => {
    totalPurchases += purchase.quantity;
  });
  
  // Get transfers
  const transfersIn = await Transfer.find({
    ...equipmentTypeFilter,
    toBase: baseFilter.base || { $exists: true },
    status: 'completed',
    ...(startDate && endDate ? {
      transferDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } : {})
  });
  
  const transfersOut = await Transfer.find({
    ...equipmentTypeFilter,
    fromBase: baseFilter.base || { $exists: true },
    status: 'completed',
    ...(startDate && endDate ? {
      transferDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } : {})
  });
  
  let totalTransfersIn = 0;
  let totalTransfersOut = 0;
  
  transfersIn.forEach(transfer => {
    totalTransfersIn += transfer.quantity;
  });
  
  transfersOut.forEach(transfer => {
    totalTransfersOut += transfer.quantity;
  });
  
  // Calculate net movement
  const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
  
  res.status(200).json({
    success: true,
    data: {
      openingBalance,
      closingBalance,
      netMovement,
      netMovementDetails: {
        purchases: totalPurchases,
        transfersIn: totalTransfersIn,
        transfersOut: totalTransfersOut
      },
      assigned,
      expended
    }
  });
});
