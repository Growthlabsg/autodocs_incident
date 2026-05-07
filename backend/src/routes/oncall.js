// src/routes/oncall.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get current on-call
router.get('/current', async (req, res) => {
    try {
        const result = await query('SELECT * FROM oncall_current');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching on-call' });
    }
});

// Get all schedules
router.get('/schedules', async (req, res) => {
    try {
        const result = await query('SELECT * FROM oncall_schedules WHERE is_active = true');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching schedules' });
    }
});

// Get shifts for schedule
router.get('/schedules/:id/shifts', async (req, res) => {
    try {
        const result = await query(
            `SELECT s.*, u.first_name, u.last_name, u.email
             FROM oncall_shifts s
             JOIN users u ON s.user_id = u.id
             WHERE s.schedule_id = $1
             ORDER BY s.start_time ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching shifts' });
    }
});

// Create shift
router.post('/shifts', async (req, res) => {
    try {
        const { scheduleId, userId, startTime, endTime } = req.body;
        const result = await query(
            'INSERT INTO oncall_shifts (schedule_id, user_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [scheduleId, userId, startTime, endTime]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating shift' });
    }
});

module.exports = router;
