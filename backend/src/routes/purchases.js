const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase
} = require('../controllers/purchases');

router
  .route('/')
  .get(protect, getPurchases)
  .post(protect, createPurchase);

router
  .route('/:id')
  .get(protect, getPurchase)
  .put(protect, authorize('admin'), updatePurchase)
  .delete(protect, authorize('admin'), deletePurchase);

module.exports = router;
