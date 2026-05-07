// src/graphql/resolvers.js
// GraphQL Resolvers

const db = require('../config/database');

const resolvers = {
    Query: {
        incidents: async (_, { status, severity, limit = 50, offset = 0 }) => {
            let query = 'SELECT * FROM incidents WHERE 1=1';
            const params = [];
            let paramCount = 1;

            if (status) {
                query += ` AND status = $${paramCount}`;
                params.push(status);
                paramCount++;
            }
            if (severity) {
                query += ` AND severity = $${paramCount}`;
                params.push(severity);
                paramCount++;
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);

            const result = await db.query(query, params);
            return result.rows;
        },

        incident: async (_, { id }) => {
            const result = await db.query('SELECT * FROM incidents WHERE id = $1', [id]);
            return result.rows[0];
        },

        services: async () => {
            const result = await db.query('SELECT * FROM services ORDER BY name');
            return result.rows;
        },

        service: async (_, { id }) => {
            const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
            return result.rows[0];
        },

        users: async () => {
            const result = await db.query('SELECT * FROM users ORDER BY first_name');
            return result.rows;
        },

        user: async (_, { id }) => {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        },

        teams: async () => {
            const result = await db.query('SELECT * FROM teams ORDER BY name');
            return result.rows;
        },

        team: async (_, { id }) => {
            const result = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
            return result.rows[0];
        },

        analytics: async (_, { dateRange = '30d' }) => {
            const days = parseInt(dateRange.replace('d', ''));
            const query = `
                SELECT 
                    COUNT(*) as total_incidents,
                    COUNT(*) FILTER (WHERE severity = 'SEV1') as sev1_count,
                    COUNT(*) FILTER (WHERE severity = 'SEV2') as sev2_count,
                    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_mttr_hours
                FROM incidents
                WHERE created_at >= NOW() - INTERVAL '${days} days'
            `;
            const result = await db.query(query);
            return result.rows[0];
        },

        workflows: async () => {
            const result = await db.query('SELECT * FROM workflows ORDER BY name');
            return result.rows;
        },

        workflow: async (_, { id }) => {
            const result = await db.query('SELECT * FROM workflows WHERE id = $1', [id]);
            return result.rows[0];
        }
    },

    Mutation: {
        createIncident: async (_, { title, description, severity, service_id }) => {
            const result = await db.query(
                `INSERT INTO incidents (title, description, severity, service_id, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, 'investigating', NOW(), NOW())
                 RETURNING *`,
                [title, description, severity, service_id]
            );
            return result.rows[0];
        },

        updateIncident: async (_, { id, title, description, severity, status }) => {
            const updates = [];
            const params = [id];
            let paramCount = 2;

            if (title) {
                updates.push(`title = $${paramCount}`);
                params.push(title);
                paramCount++;
            }
            if (description) {
                updates.push(`description = $${paramCount}`);
                params.push(description);
                paramCount++;
            }
            if (severity) {
                updates.push(`severity = $${paramCount}`);
                params.push(severity);
                paramCount++;
            }
            if (status) {
                updates.push(`status = $${paramCount}`);
                params.push(status);
                paramCount++;
            }

            updates.push(`updated_at = NOW()`);

            const query = `UPDATE incidents SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
            const result = await db.query(query, params);
            return result.rows[0];
        },

        assignIncident: async (_, { incident_id, user_id }) => {
            await db.query(
                'INSERT INTO incident_assignees (incident_id, user_id) VALUES ($1, $2)',
                [incident_id, user_id]
            );
            
            const result = await db.query('SELECT * FROM incidents WHERE id = $1', [incident_id]);
            return result.rows[0];
        },

        addIncidentUpdate: async (_, { incident_id, message }, context) => {
            const user_id = context.user?.id;
            
            const result = await db.query(
                `INSERT INTO incident_updates (incident_id, user_id, message, created_at)
                 VALUES ($1, $2, $3, NOW())
                 RETURNING *`,
                [incident_id, user_id, message]
            );
            return result.rows[0];
        },

        createService: async (_, { name, description, status = 'operational' }) => {
            const result = await db.query(
                `INSERT INTO services (name, description, status, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())
                 RETURNING *`,
                [name, description, status]
            );
            return result.rows[0];
        },

        updateService: async (_, { id, name, description, status }) => {
            const updates = [];
            const params = [id];
            let paramCount = 2;

            if (name) {
                updates.push(`name = $${paramCount}`);
                params.push(name);
                paramCount++;
            }
            if (description) {
                updates.push(`description = $${paramCount}`);
                params.push(description);
                paramCount++;
            }
            if (status) {
                updates.push(`status = $${paramCount}`);
                params.push(status);
                paramCount++;
            }

            updates.push(`updated_at = NOW()`);

            const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
            const result = await db.query(query, params);
            return result.rows[0];
        },

        createWorkflow: async (_, { name, description, trigger_event, definition }) => {
            const result = await db.query(
                `INSERT INTO workflows (name, description, trigger_event, definition, is_active, created_at)
                 VALUES ($1, $2, $3, $4, true, NOW())
                 RETURNING *`,
                [name, description, trigger_event, definition]
            );
            return result.rows[0];
        },

        updateWorkflow: async (_, { id, name, description, is_active, definition }) => {
            const updates = [];
            const params = [id];
            let paramCount = 2;

            if (name) {
                updates.push(`name = $${paramCount}`);
                params.push(name);
                paramCount++;
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount}`);
                params.push(description);
                paramCount++;
            }
            if (is_active !== undefined) {
                updates.push(`is_active = $${paramCount}`);
                params.push(is_active);
                paramCount++;
            }
            if (definition) {
                updates.push(`definition = $${paramCount}`);
                params.push(definition);
                paramCount++;
            }

            const query = `UPDATE workflows SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
            const result = await db.query(query, params);
            return result.rows[0];
        }
    },

    // Field resolvers
    Incident: {
        service: async (parent) => {
            if (!parent.service_id) return null;
            const result = await db.query('SELECT * FROM services WHERE id = $1', [parent.service_id]);
            return result.rows[0];
        },

        assignees: async (parent) => {
            const query = `
                SELECT u.* FROM users u
                JOIN incident_assignees ia ON u.id = ia.user_id
                WHERE ia.incident_id = $1
            `;
            const result = await db.query(query, [parent.id]);
            return result.rows;
        },

        updates: async (parent) => {
            const result = await db.query(
                'SELECT * FROM incident_updates WHERE incident_id = $1 ORDER BY created_at',
                [parent.id]
            );
            return result.rows;
        }
    },

    IncidentUpdate: {
        user: async (parent) => {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [parent.user_id]);
            return result.rows[0];
        }
    },

    Service: {
        incidents: async (parent) => {
            const result = await db.query(
                'SELECT * FROM incidents WHERE service_id = $1 ORDER BY created_at DESC LIMIT 10',
                [parent.id]
            );
            return result.rows;
        }
    },

    Team: {
        members: async (parent) => {
            const query = `
                SELECT u.* FROM users u
                JOIN team_members tm ON u.id = tm.user_id
                WHERE tm.team_id = $1
            `;
            const result = await db.query(query, [parent.id]);
            return result.rows;
        }
    }
};

module.exports = resolvers;
