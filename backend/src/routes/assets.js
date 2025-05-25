const express = require('express');
const router = express.Router();
const { protect, authorize, baseAccess } = require('../middleware/auth');

const {
  getAssets,
  getAsset,
  getDashboardMetrics
} = require('../controllers/assets');

router
  .route('/')
  .get(protect, baseAccess, getAssets);

router
  .route('/dashboard')
  .get(protect, baseAccess, getDashboardMetrics);

router
  .route('/:id')
  .get(protect, baseAccess, getAsset);

module.exports = router;
