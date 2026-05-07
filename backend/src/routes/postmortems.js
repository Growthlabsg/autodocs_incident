// src/routes/postmortems.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all postmortems
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT p.*, i.title as incident_title, i.incident_number
             FROM postmortems p
             JOIN incidents i ON p.incident_id = i.id
             ORDER BY p.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching postmortems' });
    }
});

// Create postmortem
router.post('/', async (req, res) => {
    try {
        const { incidentId, title, summary, rootCause } = req.body;
        const result = await query(
            'INSERT INTO postmortems (incident_id, title, summary, root_cause, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [incidentId, title, summary, rootCause, req.user.id]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating postmortem' });
    }
});

module.exports = router;
