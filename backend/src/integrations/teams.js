// src/integrations/teams.js
// Microsoft Teams Integration

const axios = require('axios');

class TeamsIntegration {
    constructor() {
        this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    }

    async sendIncidentNotification(incident, channelWebhook = null) {
        const webhook = channelWebhook || this.webhookUrl;
        
        if (!webhook) {
            console.warn('Teams webhook not configured');
            return;
        }

        const card = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": `Incident ${incident.incident_number}`,
            "themeColor": this.getSeverityColor(incident.severity),
            "title": `[${incident.severity}] ${incident.title}`,
            "sections": [{
                "activityTitle": `Incident ${incident.incident_number}`,
                "facts": [
                    { "name": "Severity", "value": incident.severity },
                    { "name": "Status", "value": incident.status },
                    { "name": "Service", "value": incident.service_name || 'N/A' },
                    { "name": "Created", "value": new Date(incident.created_at).toLocaleString() }
                ],
                "text": incident.description
            }],
            "potentialAction": [{
                "@type": "OpenUri",
                "name": "View Incident",
                "targets": [{
                    "os": "default",
                    "uri": `${process.env.FRONTEND_URL}/incidents/${incident.id}`
                }]
            }]
        };

        try {
            await axios.post(webhook, card);
            console.log('✅ Teams notification sent');
        } catch (error) {
            console.error('❌ Teams notification failed:', error.message);
        }
    }

    getSeverityColor(severity) {
        const colors = {
            'SEV1': 'FF0000', // Red
            'SEV2': 'FFA500', // Orange
            'SEV3': 'FFFF00', // Yellow
            'SEV4': '808080'  // Gray
        };
        return colors[severity] || '0078D4';
    }
}

module.exports = new TeamsIntegration();
