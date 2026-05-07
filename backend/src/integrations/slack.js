// src/integrations/slack.js
// Slack Integration

const { WebClient } = require('@slack/web-api');

class SlackIntegration {
    constructor() {
        this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
    }

    async sendIncidentNotification(incident, channel = '#incidents') {
        try {
            const severityEmoji = {
                SEV1: '🔴',
                SEV2: '🟠',
                SEV3: '🟡',
                SEV4: '⚪'
            };

            await this.client.chat.postMessage({
                channel: channel,
                text: `${severityEmoji[incident.severity]} New Incident: ${incident.title}`,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${severityEmoji[incident.severity]} ${incident.incident_number}`
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Title:*\n${incident.title}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Severity:*\n${incident.severity}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Status:*\n${incident.status}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Created:*\n${incident.created_at}`
                            }
                        ]
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: 'View Incident'
                                },
                                url: `${process.env.FRONTEND_URL}/incidents/${incident.id}`
                            }
                        ]
                    }
                ]
            });

            console.log('✅ Slack notification sent');
        } catch (error) {
            console.error('❌ Slack notification failed:', error);
        }
    }

    async sendIncidentUpdate(incident, update) {
        try {
            await this.client.chat.postMessage({
                channel: '#incidents',
                text: `Update on ${incident.incident_number}: ${update.message}`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Update on ${incident.incident_number}*\n${update.message}`
                        }
                    }
                ]
            });

            console.log('✅ Slack update sent');
        } catch (error) {
            console.error('❌ Slack update failed:', error);
        }
    }
}

module.exports = new SlackIntegration();
