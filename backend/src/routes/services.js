// src/routes/services.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all services
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM services ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching service' });
    }
});

// Create service
router.post('/', async (req, res) => {
    try {
        const { name, description, ownerTeamId } = req.body;
        const result = await query(
            'INSERT INTO services (name, description, owner_team_id) VALUES ($1, $2, $3) RETURNING *',
            [name, description, ownerTeamId]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating service' });
    }
});

// Update service
router.put('/:id', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const result = await query(
            'UPDATE services SET name = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
            [name, description, status, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating service' });
    }
});

module.exports = router;
