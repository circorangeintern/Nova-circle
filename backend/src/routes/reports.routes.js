const express = require('express');
const {
  createReport,
  myReports,
  getMyReport,
  updateReport,
  deleteReport,
} = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// All routes here are for authenticated citizens submitting/viewing their own reports
router.post('/', requireAuth, requireRole('CITIZEN'), upload.single('photo'), createReport);
router.get('/mine', requireAuth, requireRole('CITIZEN'), myReports);
router.get('/:id', requireAuth, requireRole('CITIZEN'), getMyReport);
router.patch('/:id', requireAuth, requireRole('CITIZEN'), upload.single('photo'), updateReport);
router.delete('/:id', requireAuth, requireRole('CITIZEN'), deleteReport);

module.exports = router;
