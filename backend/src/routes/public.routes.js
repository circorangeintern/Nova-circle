const express = require('express');
const { listPublicReports, getPublicReport } = require('../controllers/report.controller');

const router = express.Router();

// Open to everyone — the "General Public" secondary user in the PRD
router.get('/reports', listPublicReports);
router.get('/reports/:id', getPublicReport);

module.exports = router;
