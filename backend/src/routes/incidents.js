// src/routes/incidents.js
// Incident Management Routes

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// All incident routes require authentication
router.use(protect);

// @route   GET /api/incidents
// @desc    Get all incidents
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { status, severity, limit = 50, offset = 0 } = req.query;

        let sql = `
            SELECT i.*, 
                   json_agg(DISTINCT jsonb_build_object(
                       'id', u.id,
                       'firstName', u.first_name,
                       'lastName', u.last_name,
                       'email', u.email
                   )) FILTER (WHERE u.id IS NOT NULL) as assignees,
                   json_agg(DISTINCT jsonb_build_object(
                       'id', s.id,
                       'name', s.name
                   )) FILTER (WHERE s.id IS NOT NULL) as services
            FROM incidents i
            LEFT JOIN incident_assignees ia ON i.id = ia.incident_id
            LEFT JOIN users u ON ia.user_id = u.id
            LEFT JOIN incident_services iis ON i.id = iis.incident_id
            LEFT JOIN services s ON iis.service_id = s.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 1;

        if (status) {
            conditions.push(`i.status = $${paramCount++}`);
            params.push(status);
        }

        if (severity) {
            conditions.push(`i.severity = $${paramCount++}`);
            params.push(severity);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ` GROUP BY i.id ORDER BY i.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
        params.push(limit, offset);

        const result = await query(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) FROM incidents';
        if (conditions.length > 0) {
            countSql += ' WHERE ' + conditions.join(' AND ');
        }
        const countResult = await query(countSql, params.slice(0, -2));

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching incidents'
        });
    }
});

// @route   GET /api/incidents/:id
// @desc    Get single incident
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT i.*,
                    json_agg(DISTINCT jsonb_build_object(
                        'id', u.id,
                        'firstName', u.first_name,
                        'lastName', u.last_name,
                        'email', u.email
                    )) FILTER (WHERE u.id IS NOT NULL) as assignees,
                    json_agg(DISTINCT jsonb_build_object(
                        'id', s.id,
                        'name', s.name,
                        'status', s.status
                    )) FILTER (WHERE s.id IS NOT NULL) as services
             FROM incidents i
             LEFT JOIN incident_assignees ia ON i.id = ia.incident_id
             LEFT JOIN users u ON ia.user_id = u.id
             LEFT JOIN incident_services iis ON i.id = iis.incident_id
             LEFT JOIN services s ON iis.service_id = s.id
             WHERE i.id = $1
             GROUP BY i.id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // Get updates
        const updates = await query(
            `SELECT iu.*, u.first_name, u.last_name, u.email
             FROM incident_updates iu
             LEFT JOIN users u ON iu.user_id = u.id
             WHERE iu.incident_id = $1
             ORDER BY iu.created_at DESC`,
            [req.params.id]
        );

        const incident = result.rows[0];
        incident.updates = updates.rows;

        res.json({
            success: true,
            data: incident
        });
    } catch (error) {
        console.error('Get incident error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching incident'
        });
    }
});

// @route   POST /api/incidents
// @desc    Create new incident
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { title, description, severity, priority, assignees, services } = req.body;

        // Validation
        if (!title || !severity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and severity'
            });
        }

        await transaction(async (client) => {
            // Create incident
            const incidentResult = await client.query(
                `INSERT INTO incidents (title, description, severity, priority, created_by, status)
                 VALUES ($1, $2, $3, $4, $5, 'investigating')
                 RETURNING *`,
                [title, description, severity, priority || 'medium', req.user.id]
            );

            const incident = incidentResult.rows[0];

            // Add assignees
            if (assignees && assignees.length > 0) {
                for (const userId of assignees) {
                    await client.query(
                        'INSERT INTO incident_assignees (incident_id, user_id) VALUES ($1, $2)',
                        [incident.id, userId]
                    );
                }
            }

            // Add services
            if (services && services.length > 0) {
                for (const serviceId of services) {
                    await client.query(
                        'INSERT INTO incident_services (incident_id, service_id) VALUES ($1, $2)',
                        [incident.id, serviceId]
                    );
                }
            }

            // Create initial update
            await client.query(
                `INSERT INTO incident_updates (incident_id, user_id, message)
                 VALUES ($1, $2, $3)`,
                [incident.id, req.user.id, 'Incident created']
            );

            res.status(201).json({
                success: true,
                data: incident
            });
        });
    } catch (error) {
        console.error('Create incident error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating incident'
        });
    }
});

// @route   PUT /api/incidents/:id
// @desc    Update incident
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { title, description, severity, priority, status } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (title) {
            updates.push(`title = $${paramCount++}`);
            params.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            params.push(description);
        }
        if (severity) {
            updates.push(`severity = $${paramCount++}`);
            params.push(severity);
        }
        if (priority) {
            updates.push(`priority = $${paramCount++}`);
            params.push(priority);
        }
        if (status) {
            updates.push(`status = $${paramCount++}`);
            params.push(status);

            if (status === 'resolved') {
                updates.push(`resolved_at = CURRENT_TIMESTAMP`);
                updates.push(`resolved_by = $${paramCount++}`);
                params.push(req.user.id);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(req.params.id);

        const result = await query(
            `UPDATE incidents SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // Create update log
        await query(
            `INSERT INTO incident_updates (incident_id, user_id, message, status_change)
             VALUES ($1, $2, $3, $4)`,
            [req.params.id, req.user.id, 'Incident updated', status]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update incident error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating incident'
        });
    }
});

// @route   POST /api/incidents/:id/updates
// @desc    Add update to incident
// @access  Private
router.post('/:id/updates', async (req, res) => {
    try {
        const { message, statusChange } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const result = await query(
            `INSERT INTO incident_updates (incident_id, user_id, message, status_change)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.params.id, req.user.id, message, statusChange]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Add update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding update'
        });
    }
});

// @route   DELETE /api/incidents/:id
// @desc    Delete incident
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM incidents WHERE id = $1 RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        res.json({
            success: true,
            message: 'Incident deleted'
        });
    } catch (error) {
        console.error('Delete incident error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting incident'
        });
    }
});

// @route   GET /api/incidents/stats/summary
// @desc    Get incident statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'investigating') as investigating,
                COUNT(*) FILTER (WHERE status = 'monitoring') as monitoring,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
                AVG(EXTRACT(EPOCH FROM (resolved_at - started_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours
            FROM incidents
        `);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;
