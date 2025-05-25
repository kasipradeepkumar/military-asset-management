const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getBases,
  getBase,
  createBase,
  updateBase,
  deleteBase
} = require('../controllers/bases');

router
  .route('/')
  .get(protect, getBases)
  .post(protect, authorize('admin'), createBase);

router
  .route('/:id')
  .get(protect, getBase)
  .put(protect, authorize('admin'), updateBase)
  .delete(protect, authorize('admin'), deleteBase);

module.exports = router;
