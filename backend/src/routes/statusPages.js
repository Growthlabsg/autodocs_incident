// src/routes/statusPages.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all status pages
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM status_pages');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching status pages' });
    }
});

// Create status page
router.post('/', async (req, res) => {
    try {
        const { name, subdomain } = req.body;
        const result = await query(
            'INSERT INTO status_pages (name, subdomain) VALUES ($1, $2) RETURNING *',
            [name, subdomain]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating status page' });
    }
});

module.exports = router;
