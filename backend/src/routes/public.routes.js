const express = require('express');
const { listPublicReports } = require('../controllers/report.controller');

const router = express.Router();

// Open to everyone — the "General Public" secondary user in the PRD
router.get('/reports', listPublicReports);

module.exports = router;
