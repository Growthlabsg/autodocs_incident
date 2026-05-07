// src/routes/teams.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all teams
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM teams ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching teams' });
    }
});

// Get team members
router.get('/:id/members', async (req, res) => {
    try {
        const result = await query(
            `SELECT tm.*, u.first_name, u.last_name, u.email, u.role
             FROM team_members tm
             JOIN users u ON tm.user_id = u.id
             WHERE tm.team_id = $1`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching team members' });
    }
});

// Create team
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await query(
            'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, description, req.user.id]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating team' });
    }
});

module.exports = router;
