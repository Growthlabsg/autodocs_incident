// src/incident-roles/incidentRoles.js
// Incident Roles System - Commander, Tech Lead, Comms Lead, Scribe

const db = require('../config/database');
const slackBot = require('../slack-bot/slackBot');

class IncidentRolesSystem {
    constructor() {
        this.ROLES = {
            COMMANDER: 'incident_commander',
            TECH_LEAD: 'tech_lead',
            COMMS_LEAD: 'comms_lead',
            SCRIBE: 'scribe'
        };
    }

    // Assign role to user
    async assignRole(incidentId, userId, role) {
        try {
            // Check if role already assigned
            const existing = await db.query(
                'SELECT * FROM incident_roles WHERE incident_id = $1 AND role = $2',
                [incidentId, role]
            );

            if (existing.rows.length > 0) {
                // Update existing role
                await db.query(
                    'UPDATE incident_roles SET user_id = $1, assigned_at = NOW() WHERE incident_id = $2 AND role = $3',
                    [userId, incidentId, role]
                );
            } else {
                // Create new role assignment
                await db.query(
                    `INSERT INTO incident_roles (incident_id, user_id, role, assigned_at)
                     VALUES ($1, $2, $3, NOW())`,
                    [incidentId, userId, role]
                );
            }

            // Log timeline event
            await this.logRoleChange(incidentId, userId, role, 'assigned');

            // Notify in Slack channel
            await this.notifyRoleAssignment(incidentId, userId, role);

            console.log(`✅ Assigned ${role} to user ${userId} for incident ${incidentId}`);
            return true;

        } catch (error) {
            console.error('Error assigning role:', error);
            throw error;
        }
    }

    // Get all roles for an incident
    async getIncidentRoles(incidentId) {
        const result = await db.query(
            `SELECT ir.*, u.first_name, u.last_name, u.email, u.slack_user_id
             FROM incident_roles ir
             JOIN users u ON ir.user_id = u.id
             WHERE ir.incident_id = $1
             ORDER BY 
                CASE ir.role
                    WHEN 'incident_commander' THEN 1
                    WHEN 'tech_lead' THEN 2
                    WHEN 'comms_lead' THEN 3
                    WHEN 'scribe' THEN 4
                    ELSE 5
                END`,
            [incidentId]
        );

        return result.rows;
    }

    // Auto-assign roles based on rules
    async autoAssignRoles(incident) {
        try {
            const { id, severity, service_id, team_id } = incident;

            // Auto-assign Incident Commander from on-call
            const commander = await this.getOnCallCommander();
            if (commander) {
                await this.assignRole(id, commander.id, this.ROLES.COMMANDER);
            }

            // For SEV1/SEV2, auto-assign Tech Lead
            if (severity === 'SEV1' || severity === 'SEV2') {
                const techLead = await this.getTechLeadForService(service_id);
                if (techLead) {
                    await this.assignRole(id, techLead.id, this.ROLES.TECH_LEAD);
                }
            }

            // For SEV1, auto-assign Comms Lead
            if (severity === 'SEV1') {
                const commsLead = await this.getCommsLead();
                if (commsLead) {
                    await this.assignRole(id, commsLead.id, this.ROLES.COMMS_LEAD);
                }
            }

            console.log(`✅ Auto-assigned roles for incident ${id}`);

        } catch (error) {
            console.error('Error auto-assigning roles:', error);
        }
    }

    // Get current on-call person for commander
    async getOnCallCommander() {
        const result = await db.query(
            `SELECT u.* FROM users u
             JOIN oncall_shifts os ON u.id = os.user_id
             WHERE NOW() BETWEEN os.start_time AND os.end_time
             AND os.is_commander_eligible = true
             ORDER BY os.created_at DESC
             LIMIT 1`
        );

        return result.rows[0];
    }

    // Get tech lead for service
    async getTechLeadForService(serviceId) {
        if (!serviceId) return null;

        const result = await db.query(
            `SELECT u.* FROM users u
             JOIN team_members tm ON u.id = tm.user_id
             JOIN services s ON tm.team_id = s.team_id
             WHERE s.id = $1
             AND tm.role = 'tech_lead'
             LIMIT 1`,
            [serviceId]
        );

        return result.rows[0];
    }

    // Get comms lead
    async getCommsLead() {
        const result = await db.query(
            `SELECT u.* FROM users u
             WHERE u.role = 'comms_lead' OR u.is_comms_eligible = true
             ORDER BY (
                SELECT COUNT(*) FROM incident_roles ir
                WHERE ir.user_id = u.id AND ir.role = 'comms_lead'
             ) ASC
             LIMIT 1`
        );

        return result.rows[0];
    }

    // Remove role from incident
    async removeRole(incidentId, role) {
        await db.query(
            'DELETE FROM incident_roles WHERE incident_id = $1 AND role = $2',
            [incidentId, role]
        );

        await this.logRoleChange(incidentId, null, role, 'removed');
    }

    // Get user's current active roles
    async getUserActiveRoles(userId) {
        const result = await db.query(
            `SELECT ir.*, i.incident_number, i.title, i.severity, i.status
             FROM incident_roles ir
             JOIN incidents i ON ir.incident_id = i.id
             WHERE ir.user_id = $1
             AND i.status NOT IN ('resolved', 'closed')
             ORDER BY i.created_at DESC`,
            [userId]
        );

        return result.rows;
    }

    // Get role holder for incident
    async getRoleHolder(incidentId, role) {
        const result = await db.query(
            `SELECT u.* FROM users u
             JOIN incident_roles ir ON u.id = ir.user_id
             WHERE ir.incident_id = $1 AND ir.role = $2`,
            [incidentId, role]
        );

        return result.rows[0];
    }

    // Check if user has role in incident
    async userHasRole(incidentId, userId, role) {
        const result = await db.query(
            'SELECT * FROM incident_roles WHERE incident_id = $1 AND user_id = $2 AND role = $3',
            [incidentId, userId, role]
        );

        return result.rows.length > 0;
    }

    // Log role change to timeline
    async logRoleChange(incidentId, userId, role, action) {
        const message = userId 
            ? `Role ${role} ${action} to user ${userId}`
            : `Role ${role} ${action}`;

        await db.query(
            `INSERT INTO incident_timeline (incident_id, event_type, message, user_id, created_at)
             VALUES ($1, 'role_change', $2, $3, NOW())`,
            [incidentId, message, userId]
        );
    }

    // Notify role assignment in Slack
    async notifyRoleAssignment(incidentId, userId, role) {
        try {
            const incident = await db.query(
                'SELECT * FROM incidents WHERE id = $1',
                [incidentId]
            );

            if (incident.rows[0]?.slack_channel_id) {
                const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
                const slackId = user.rows[0]?.slack_user_id;

                if (slackId) {
                    const roleEmoji = this.getRoleEmoji(role);
                    await slackBot.client.chat.postMessage({
                        channel: incident.rows[0].slack_channel_id,
                        text: `${roleEmoji} <@${slackId}> has been assigned as *${this.getRoleName(role)}*`
                    });
                }
            }
        } catch (error) {
            console.error('Error notifying role assignment:', error);
        }
    }

    // Helper: Get role emoji
    getRoleEmoji(role) {
        const emojis = {
            incident_commander: '👨‍✈️',
            tech_lead: '👨‍💻',
            comms_lead: '📢',
            scribe: '📝'
        };
        return emojis[role] || '👤';
    }

    // Helper: Get role display name
    getRoleName(role) {
        const names = {
            incident_commander: 'Incident Commander',
            tech_lead: 'Tech Lead',
            comms_lead: 'Communications Lead',
            scribe: 'Scribe'
        };
        return names[role] || role;
    }

    // Get role responsibilities
    getRoleResponsibilities(role) {
        const responsibilities = {
            incident_commander: [
                'Lead the incident response',
                'Coordinate team members',
                'Make decisions on escalation',
                'Ensure proper documentation',
                'Communicate with stakeholders'
            ],
            tech_lead: [
                'Lead technical investigation',
                'Coordinate technical fixes',
                'Review code changes',
                'Validate solutions',
                'Provide technical expertise'
            ],
            comms_lead: [
                'Draft status updates',
                'Communicate with customers',
                'Update status page',
                'Handle external communications',
                'Coordinate with support team'
            ],
            scribe: [
                'Document incident timeline',
                'Record key decisions',
                'Track action items',
                'Capture important details',
                'Help with post-mortem'
            ]
        };
        return responsibilities[role] || [];
    }
}

module.exports = new IncidentRolesSystem();
