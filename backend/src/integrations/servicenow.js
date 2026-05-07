// src/integrations/servicenow.js
// ServiceNow Integration

const axios = require('axios');

class ServiceNowIntegration {
    constructor() {
        this.instance = process.env.SERVICENOW_INSTANCE;
        this.username = process.env.SERVICENOW_USERNAME;
        this.password = process.env.SERVICENOW_PASSWORD;
        
        this.client = axios.create({
            baseURL: `https://${this.instance}.service-now.com/api/now`,
            auth: {
                username: this.username,
                password: this.password
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    async createIncident(incident) {
        try {
            const response = await this.client.post('/table/incident', {
                short_description: `[${incident.severity}] ${incident.title}`,
                description: incident.description,
                urgency: this.mapSeverityToUrgency(incident.severity),
                impact: this.mapSeverityToImpact(incident.severity),
                category: 'software',
                subcategory: 'application'
            });

            console.log('✅ ServiceNow incident created:', response.data.result.number);
            return response.data.result;
        } catch (error) {
            console.error('❌ ServiceNow create failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateIncident(sysId, updates) {
        try {
            await this.client.patch(`/table/incident/${sysId}`, updates);
            console.log('✅ ServiceNow incident updated');
        } catch (error) {
            console.error('❌ ServiceNow update failed:', error.response?.data || error.message);
        }
    }

    async resolveIncident(sysId, resolutionNotes) {
        try {
            await this.client.patch(`/table/incident/${sysId}`, {
                state: 6, // Resolved
                close_notes: resolutionNotes
            });
            console.log('✅ ServiceNow incident resolved');
        } catch (error) {
            console.error('❌ ServiceNow resolve failed:', error.response?.data || error.message);
        }
    }

    mapSeverityToUrgency(severity) {
        const map = { 'SEV1': 1, 'SEV2': 2, 'SEV3': 3, 'SEV4': 3 };
        return map[severity] || 3;
    }

    mapSeverityToImpact(severity) {
        const map = { 'SEV1': 1, 'SEV2': 2, 'SEV3': 3, 'SEV4': 3 };
        return map[severity] || 3;
    }
}

module.exports = new ServiceNowIntegration();
