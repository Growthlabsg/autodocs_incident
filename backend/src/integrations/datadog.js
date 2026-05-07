// src/integrations/datadog.js
// Datadog Monitoring Integration

const axios = require('axios');

class DatadogIntegration {
    constructor() {
        this.apiKey = process.env.DATADOG_API_KEY;
        this.appKey = process.env.DATADOG_APP_KEY;
        this.client = axios.create({
            baseURL: 'https://api.datadoghq.com/api/v1',
            headers: {
                'DD-API-KEY': this.apiKey,
                'DD-APPLICATION-KEY': this.appKey,
                'Content-Type': 'application/json'
            }
        });
    }

    async createEvent(incident) {
        try {
            await this.client.post('/events', {
                title: `[${incident.severity}] ${incident.title}`,
                text: `Incident ${incident.incident_number} created\n\n${incident.description}`,
                tags: [
                    `severity:${incident.severity.toLowerCase()}`,
                    `status:${incident.status}`,
                    'source:autodocs-autoincident'
                ],
                alert_type: incident.severity === 'SEV1' ? 'error' : 'warning'
            });

            console.log('✅ Datadog event created');
        } catch (error) {
            console.error('❌ Datadog event failed:', error.response?.data || error.message);
        }
    }

    async sendMetric(metricName, value, tags = []) {
        try {
            await this.client.post('/series', {
                series: [{
                    metric: `autodocs.${metricName}`,
                    points: [[Math.floor(Date.now() / 1000), value]],
                    type: 'gauge',
                    tags: [...tags, 'service:autodocs-autoincident']
                }]
            });

            console.log('✅ Datadog metric sent');
        } catch (error) {
            console.error('❌ Datadog metric failed:', error.response?.data || error.message);
        }
    }

    async trackIncidentMetrics(stats) {
        try {
            await this.sendMetric('incidents.total', stats.total);
            await this.sendMetric('incidents.investigating', stats.investigating);
            await this.sendMetric('incidents.resolved', stats.resolved);
            await this.sendMetric('incidents.mttr_hours', stats.avg_resolution_hours || 0);

            console.log('✅ Incident metrics tracked');
        } catch (error) {
            console.error('❌ Metrics tracking failed:', error);
        }
    }
}

module.exports = new DatadogIntegration();
