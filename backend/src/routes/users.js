// src/routes/users.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get all users
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, first_name, last_name, role, avatar_url, created_at FROM users WHERE is_active = true ORDER BY created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, first_name, last_name, role, avatar_url, created_at FROM users WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, avatarUrl } = req.body;
        const result = await query(
            'UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3 WHERE id = $4 RETURNING id, email, first_name, last_name, role, avatar_url',
            [firstName, lastName, avatarUrl, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

module.exports = router;
