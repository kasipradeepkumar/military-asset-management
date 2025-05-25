const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getEquipmentTypes,
  getEquipmentType,
  createEquipmentType,
  updateEquipmentType,
  deleteEquipmentType
} = require('../controllers/equipmentTypes');

router
  .route('/')
  .get(protect, getEquipmentTypes)
  .post(protect, authorize('admin'), createEquipmentType);

router
  .route('/:id')
  .get(protect, getEquipmentType)
  .put(protect, authorize('admin'), updateEquipmentType)
  .delete(protect, authorize('admin'), deleteEquipmentType);

module.exports = router;
