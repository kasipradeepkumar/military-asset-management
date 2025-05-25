const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransferStatus,
  deleteTransfer
} = require('../controllers/transfers');

router
  .route('/')
  .get(protect, getTransfers)
  .post(protect, createTransfer);

router
  .route('/:id')
  .get(protect, getTransfer)
  .put(protect, updateTransferStatus)
  .delete(protect, authorize('admin'), deleteTransfer);

module.exports = router;
