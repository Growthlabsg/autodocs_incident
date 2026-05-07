// src/routes/documentation.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const result = await query('SELECT * FROM documentation_projects ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching projects' });
    }
});

// Get pages for project
router.get('/projects/:id/pages', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM documentation_pages WHERE project_id = $1 ORDER BY display_order ASC',
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching pages' });
    }
});

// Create page
router.post('/pages', async (req, res) => {
    try {
        const { projectId, title, slug, content } = req.body;
        const result = await query(
            'INSERT INTO documentation_pages (project_id, title, slug, content, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [projectId, title, slug, content, req.user.id]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating page' });
    }
});

module.exports = router;
