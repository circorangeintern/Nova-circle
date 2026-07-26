const express = require('express');
const { listAssignedReports, updateReportStatus } = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('GOVERNMENT_OFFICIAL'));

router.get('/reports', listAssignedReports);
router.patch('/reports/:id/status', updateReportStatus);

module.exports = router;
