// src/services/queue.js
// Job Queue with Bull

const Queue = require('bull');
const emailService = require('./email');
const slackIntegration = require('../integrations/slack');

// Create queues
const incidentQueue = new Queue('incidents', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

const emailQueue = new Queue('emails', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

// Process incident notifications
incidentQueue.process('notify', async (job) => {
    const { incident, action } = job.data;
    
    try {
        // Send Slack notification
        if (process.env.SLACK_BOT_TOKEN) {
            await slackIntegration.sendIncidentNotification(incident);
        }

        // Send email alerts
        if (incident.assignees && incident.assignees.length > 0) {
            const emails = incident.assignees.map(a => a.email);
            await emailService.sendIncidentAlert(incident, emails);
        }

        return { success: true };
    } catch (error) {
        console.error('Notification job failed:', error);
        throw error;
    }
});

// Process emails
emailQueue.process('send', async (job) => {
    const { type, data } = job.data;
    
    try {
        switch (type) {
            case 'weekly-summary':
                await emailService.sendWeeklySummary(data.user, data.stats);
                break;
            case 'incident-alert':
                await emailService.sendIncidentAlert(data.incident, data.recipients);
                break;
            default:
                console.log('Unknown email type:', type);
        }
        return { success: true };
    } catch (error) {
        console.error('Email job failed:', error);
        throw error;
    }
});

// Helper functions
const notifyNewIncident = (incident) => {
    incidentQueue.add('notify', { incident, action: 'created' });
};

const notifyIncidentUpdate = (incident) => {
    incidentQueue.add('notify', { incident, action: 'updated' });
};

const sendEmail = (type, data) => {
    emailQueue.add('send', { type, data });
};

module.exports = {
    incidentQueue,
    emailQueue,
    notifyNewIncident,
    notifyIncidentUpdate,
    sendEmail
};
