const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignmentStatus,
  deleteAssignment
} = require('../controllers/assignments');

router
  .route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

router
  .route('/:id')
  .get(protect, getAssignment)
  .put(protect, updateAssignmentStatus)
  .delete(protect, authorize('admin'), deleteAssignment);

module.exports = router;
