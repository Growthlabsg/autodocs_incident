// src/integrations/pagerduty.js
// PagerDuty Integration

const axios = require('axios');

class PagerDutyIntegration {
    constructor() {
        this.apiKey = process.env.PAGERDUTY_API_KEY;
        this.client = axios.create({
            baseURL: 'https://api.pagerduty.com',
            headers: {
                'Authorization': `Token token=${this.apiKey}`,
                'Accept': 'application/vnd.pagerduty+json;version=2',
                'Content-Type': 'application/json'
            }
        });
    }

    async createIncident(incident) {
        try {
            const response = await this.client.post('/incidents', {
                incident: {
                    type: 'incident',
                    title: incident.title,
                    service: {
                        id: process.env.PAGERDUTY_SERVICE_ID,
                        type: 'service_reference'
                    },
                    urgency: incident.severity === 'SEV1' || incident.severity === 'SEV2' ? 'high' : 'low',
                    body: {
                        type: 'incident_body',
                        details: incident.description
                    }
                }
            });

            console.log('✅ PagerDuty incident created:', response.data.incident.id);
            return response.data.incident;
        } catch (error) {
            console.error('❌ PagerDuty create failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateIncident(pagerdutyId, status) {
        try {
            const response = await this.client.put(`/incidents/${pagerdutyId}`, {
                incident: {
                    type: 'incident_reference',
                    status: status === 'resolved' ? 'resolved' : 'acknowledged'
                }
            });

            console.log('✅ PagerDuty incident updated');
            return response.data.incident;
        } catch (error) {
            console.error('❌ PagerDuty update failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async triggerAlert(incident, users) {
        try {
            for (const user of users) {
                await this.client.post('/incidents', {
                    incident: {
                        type: 'incident',
                        title: `[${incident.severity}] ${incident.title}`,
                        service: {
                            id: process.env.PAGERDUTY_SERVICE_ID,
                            type: 'service_reference'
                        },
                        urgency: 'high',
                        assignments: [{
                            assignee: {
                                id: user.pagerduty_id,
                                type: 'user_reference'
                            }
                        }]
                    }
                });
            }

            console.log('✅ PagerDuty alerts triggered');
        } catch (error) {
            console.error('❌ PagerDuty alert failed:', error.response?.data || error.message);
        }
    }
}

module.exports = new PagerDutyIntegration();
