const express = require('express');
const { createReport, myReports } = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// All routes here are for authenticated citizens submitting/viewing their own reports
router.post('/', requireAuth, requireRole('CITIZEN'), upload.single('photo'), createReport);
router.get('/mine', requireAuth, requireRole('CITIZEN'), myReports);

module.exports = router;
