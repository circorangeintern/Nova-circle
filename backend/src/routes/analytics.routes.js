const express = require('express');
const { getSummary, getMonthlySummary } = require('../controllers/analytics.controller');

const router = express.Router();

// Analytics dashboard data is public-facing per the PRD (transparency focused)
router.get('/summary', getSummary);
router.get('/monthly', getMonthlySummary);

module.exports = router;
