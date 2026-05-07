// src/routes/analytics.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get page views
router.get('/page-views', async (req, res) => {
    try {
        const result = await query(
            'SELECT DATE(viewed_at) as date, COUNT(*) as views FROM page_views GROUP BY DATE(viewed_at) ORDER BY date DESC LIMIT 30'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
});

// Get search analytics
router.get('/searches', async (req, res) => {
    try {
        const result = await query(
            'SELECT query, COUNT(*) as count FROM searches GROUP BY query ORDER BY count DESC LIMIT 20'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching search analytics' });
    }
});

module.exports = router;
