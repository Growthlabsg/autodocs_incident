// src/slack-bot/slackBot.js
// Slack-Native Integration - Auto-channels, Slash Commands, Bot

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const db = require('../config/database');

class SlackBot {
    constructor() {
        this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
        this.signingSecret = process.env.SLACK_SIGNING_SECRET;
    }

    // Create dedicated incident channel
    async createIncidentChannel(incident) {
        try {
            const channelName = `inc-${incident.incident_number}-${this.sanitizeName(incident.title)}`;
            
            const result = await this.client.conversations.create({
                name: channelName.toLowerCase(),
                is_private: incident.is_private || false
            });

            const channelId = result.channel.id;

            // Store channel ID in incident
            await db.query(
                'UPDATE incidents SET slack_channel_id = $1 WHERE id = $2',
                [channelId, incident.id]
            );

            // Post initial message
            await this.postChannelSummary(channelId, incident);

            // Invite relevant people
            await this.inviteToChannel(channelId, incident);

            // Set channel topic
            await this.client.conversations.setTopic({
                channel: channelId,
                topic: `${incident.severity} - ${incident.title} | Status: ${incident.status}`
            });

            console.log(`✅ Created incident channel: ${channelName}`);
            return channelId;

        } catch (error) {
            console.error('Failed to create incident channel:', error);
            throw error;
        }
    }

    // Post pinned summary in channel
    async postChannelSummary(channelId, incident) {
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `🚨 ${incident.incident_number}: ${incident.title}`
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Severity:*\n${this.getSeverityEmoji(incident.severity)} ${incident.severity}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Status:*\n${this.getStatusEmoji(incident.status)} ${incident.status}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Commander:*\n<@${incident.commander_slack_id || 'unassigned'}>`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Service:*\n${incident.service_name || 'N/A'}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Description:*\n${incident.description || 'No description provided'}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Update Status' },
                        action_id: 'incident_update_status'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Post Update' },
                        action_id: 'incident_post_update'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Escalate' },
                        style: 'danger',
                        action_id: 'incident_escalate'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'View Dashboard' },
                        url: `${process.env.FRONTEND_URL}/incidents/${incident.id}`
                    }
                ]
            }
        ];

        const result = await this.client.chat.postMessage({
            channel: channelId,
            blocks,
            text: `Incident ${incident.incident_number}: ${incident.title}`
        });

        // Pin the message
        await this.client.pins.add({
            channel: channelId,
            timestamp: result.ts
        });

        return result;
    }

    // Invite relevant people to channel
    async inviteToChannel(channelId, incident) {
        try {
            // Get team members
            if (incident.team_id) {
                const teamMembers = await db.query(
                    `SELECT u.slack_user_id FROM users u
                     JOIN team_members tm ON u.id = tm.user_id
                     WHERE tm.team_id = $1 AND u.slack_user_id IS NOT NULL`,
                    [incident.team_id]
                );

                for (const member of teamMembers.rows) {
                    try {
                        await this.client.conversations.invite({
                            channel: channelId,
                            users: member.slack_user_id
                        });
                    } catch (err) {
                        // User might already be in channel
                        console.log(`Could not invite ${member.slack_user_id}:`, err.message);
                    }
                }
            }

            // Invite assigned users
            const assignees = await db.query(
                `SELECT u.slack_user_id FROM users u
                 JOIN incident_assignees ia ON u.id = ia.user_id
                 WHERE ia.incident_id = $1 AND u.slack_user_id IS NOT NULL`,
                [incident.id]
            );

            for (const assignee of assignees.rows) {
                try {
                    await this.client.conversations.invite({
                        channel: channelId,
                        users: assignee.slack_user_id
                    });
                } catch (err) {
                    console.log(`Could not invite assignee:`, err.message);
                }
            }

        } catch (error) {
            console.error('Error inviting to channel:', error);
        }
    }

    // Handle slash command: /incident
    async handleIncidentCommand(payload) {
        const { trigger_id, text, user_id, channel_id } = payload;

        // Show modal for incident creation
        return this.showIncidentModal(trigger_id, text);
    }

    // Show incident creation modal
    async showIncidentModal(trigger_id, defaultText = '') {
        const view = {
            type: 'modal',
            callback_id: 'incident_create_modal',
            title: {
                type: 'plain_text',
                text: 'Create Incident'
            },
            submit: {
                type: 'plain_text',
                text: 'Create'
            },
            blocks: [
                {
                    type: 'input',
                    block_id: 'title',
                    label: {
                        type: 'plain_text',
                        text: 'Incident Title'
                    },
                    element: {
                        type: 'plain_text_input',
                        action_id: 'title_input',
                        initial_value: defaultText,
                        placeholder: {
                            type: 'plain_text',
                            text: 'Brief description of the incident'
                        }
                    }
                },
                {
                    type: 'input',
                    block_id: 'severity',
                    label: {
                        type: 'plain_text',
                        text: 'Severity'
                    },
                    element: {
                        type: 'static_select',
                        action_id: 'severity_select',
                        options: [
                            {
                                text: { type: 'plain_text', text: 'SEV1 - Critical' },
                                value: 'SEV1'
                            },
                            {
                                text: { type: 'plain_text', text: 'SEV2 - High' },
                                value: 'SEV2'
                            },
                            {
                                text: { type: 'plain_text', text: 'SEV3 - Medium' },
                                value: 'SEV3'
                            },
                            {
                                text: { type: 'plain_text', text: 'SEV4 - Low' },
                                value: 'SEV4'
                            }
                        ],
                        initial_option: {
                            text: { type: 'plain_text', text: 'SEV3 - Medium' },
                            value: 'SEV3'
                        }
                    }
                },
                {
                    type: 'input',
                    block_id: 'description',
                    label: {
                        type: 'plain_text',
                        text: 'Description'
                    },
                    element: {
                        type: 'plain_text_input',
                        action_id: 'description_input',
                        multiline: true,
                        placeholder: {
                            type: 'plain_text',
                            text: 'What is happening? What is the impact?'
                        }
                    },
                    optional: true
                }
            ]
        };

        return this.client.views.open({
            trigger_id,
            view
        });
    }

    // Handle modal submission
    async handleModalSubmission(payload) {
        const { user, view } = payload;
        const values = view.state.values;

        const title = values.title.title_input.value;
        const severity = values.severity.severity_select.selected_option.value;
        const description = values.description.description_input.value || '';

        // Create incident in database
        const result = await db.query(
            `INSERT INTO incidents (title, description, severity, status, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, 'investigating', $4, NOW(), NOW())
             RETURNING *`,
            [title, description, severity, user.id]
        );

        const incident = result.rows[0];

        // Create Slack channel
        await this.createIncidentChannel(incident);

        // Post to status page if SEV1/SEV2
        if (severity === 'SEV1' || severity === 'SEV2') {
            // Trigger status page update (would call status page service)
        }

        return {
            response_action: 'clear'
        };
    }

    // In-channel slash commands
    async handleChannelCommand(payload) {
        const { command, text, channel_id, user_id } = payload;

        // Get incident from channel
        const incidentResult = await db.query(
            'SELECT * FROM incidents WHERE slack_channel_id = $1',
            [channel_id]
        );

        if (incidentResult.rows.length === 0) {
            return {
                response_type: 'ephemeral',
                text: 'This is not an incident channel'
            };
        }

        const incident = incidentResult.rows[0];

        switch (command) {
            case '/incident-status':
                return this.updateIncidentStatus(incident, text, channel_id);
            
            case '/incident-update':
                return this.postIncidentUpdate(incident, text, channel_id, user_id);
            
            case '/incident-escalate':
                return this.escalateIncident(incident, channel_id);
            
            case '/incident-resolve':
                return this.resolveIncident(incident, channel_id);
            
            default:
                return { text: 'Unknown command' };
        }
    }

    // Update incident status
    async updateIncidentStatus(incident, newStatus, channelId) {
        await db.query(
            'UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2',
            [newStatus, incident.id]
        );

        await this.client.chat.postMessage({
            channel: channelId,
            text: `Status updated to: *${newStatus}*`
        });

        // Update pinned summary
        await this.postChannelSummary(channelId, { ...incident, status: newStatus });

        return { response_type: 'in_channel' };
    }

    // Post incident update
    async postIncidentUpdate(incident, updateText, channelId, userId) {
        // Save to database
        await db.query(
            `INSERT INTO incident_updates (incident_id, user_id, message, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [incident.id, userId, updateText]
        );

        // Post formatted update
        await this.client.chat.postMessage({
            channel: channelId,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*📢 Incident Update*\n${updateText}`
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `Posted by <@${userId}> at ${new Date().toLocaleTimeString()}`
                        }
                    ]
                }
            ]
        });

        return { response_type: 'in_channel' };
    }

    // Helper methods
    sanitizeName(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 40);
    }

    getSeverityEmoji(severity) {
        const emojis = {
            SEV1: '🔴',
            SEV2: '🟠',
            SEV3: '🟡',
            SEV4: '🟢'
        };
        return emojis[severity] || '⚪';
    }

    getStatusEmoji(status) {
        const emojis = {
            investigating: '🔍',
            identified: '✅',
            monitoring: '👀',
            resolved: '✅'
        };
        return emojis[status] || '❓';
    }
}

module.exports = new SlackBot();
