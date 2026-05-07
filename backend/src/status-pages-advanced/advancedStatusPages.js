// src/status-pages-advanced/advancedStatusPages.js
// Advanced Status Pages - Components, Subscriptions, Uptime Tracking

const db = require('../config/database');
const emailService = require('../services/email');

class AdvancedStatusPages {
    // Create status page with components
    async createStatusPage(data) {
        const {
            name,
            subdomain,
            type = 'public', // public, private, internal
            custom_domain,
            branding = {}
        } = data;

        const result = await db.query(
            `INSERT INTO status_pages_v2 
             (name, subdomain, type, custom_domain, branding, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING *`,
            [name, subdomain, type, custom_domain, JSON.stringify(branding)]
        );

        return result.rows[0];
    }

    // Add component to status page
    async addComponent(statusPageId, componentData) {
        const {
            name,
            description,
            status = 'operational', // operational, degraded, partial_outage, major_outage, maintenance
            group,
            display_order = 0
        } = componentData;

        const result = await db.query(
            `INSERT INTO status_page_components
             (status_page_id, name, description, status, component_group, display_order, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
            [statusPageId, name, description, status, group, display_order]
        );

        // Initialize uptime tracking
        await this.initializeUptimeTracking(result.rows[0].id);

        return result.rows[0];
    }

    // Initialize uptime tracking for component
    async initializeUptimeTracking(componentId) {
        // Create 90 days of historical uptime data (100% operational by default)
        const today = new Date();
        
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            await db.query(
                `INSERT INTO component_uptime
                 (component_id, date, uptime_percentage, total_minutes, down_minutes)
                 VALUES ($1, $2, 100.0, 1440, 0)
                 ON CONFLICT (component_id, date) DO NOTHING`,
                [componentId, date.toISOString().split('T')[0]]
            );
        }
    }

    // Update component status
    async updateComponentStatus(componentId, newStatus, message = null) {
        // Get current status
        const current = await db.query(
            'SELECT * FROM status_page_components WHERE id = $1',
            [componentId]
        );

        const oldStatus = current.rows[0].status;

        // Update status
        await db.query(
            'UPDATE status_page_components SET status = $1, updated_at = NOW() WHERE id = $2',
            [newStatus, componentId]
        );

        // Log status change
        await db.query(
            `INSERT INTO component_status_history
             (component_id, old_status, new_status, message, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [componentId, oldStatus, newStatus, message]
        );

        // Update uptime tracking
        await this.updateUptimeTracking(componentId, newStatus);

        // Notify subscribers if degraded
        if (newStatus !== 'operational') {
            await this.notifySubscribers(componentId, newStatus, message);
        }

        return true;
    }

    // Update uptime tracking
    async updateUptimeTracking(componentId, status) {
        const today = new Date().toISOString().split('T')[0];
        
        // Get current day's tracking
        const result = await db.query(
            'SELECT * FROM component_uptime WHERE component_id = $1 AND date = $2',
            [componentId, today]
        );

        if (result.rows.length === 0) {
            // Create today's entry
            await db.query(
                `INSERT INTO component_uptime (component_id, date, uptime_percentage, total_minutes, down_minutes)
                 VALUES ($1, $2, 100.0, 0, 0)`,
                [componentId, today]
            );
        }

        // If status is not operational, increment downtime
        if (status !== 'operational') {
            await db.query(
                `UPDATE component_uptime 
                 SET down_minutes = down_minutes + 1,
                     uptime_percentage = CASE 
                         WHEN total_minutes > 0 
                         THEN ((total_minutes - down_minutes - 1) * 100.0 / total_minutes)
                         ELSE 100.0
                     END
                 WHERE component_id = $1 AND date = $2`,
                [componentId, today]
            );
        }

        // Always increment total minutes
        await db.query(
            'UPDATE component_uptime SET total_minutes = total_minutes + 1 WHERE component_id = $1 AND date = $2',
            [componentId, today]
        );
    }

    // Calculate uptime percentage
    async getUptimePercentage(componentId, days = 90) {
        const result = await db.query(
            `SELECT AVG(uptime_percentage) as avg_uptime
             FROM component_uptime
             WHERE component_id = $1
             AND date >= CURRENT_DATE - INTERVAL '${days} days'`,
            [componentId]
        );

        return result.rows[0]?.avg_uptime || 100.0;
    }

    // Get uptime history for charts
    async getUptimeHistory(componentId, days = 90) {
        const result = await db.query(
            `SELECT date, uptime_percentage, down_minutes
             FROM component_uptime
             WHERE component_id = $1
             AND date >= CURRENT_DATE - INTERVAL '${days} days'
             ORDER BY date ASC`,
            [componentId]
        );

        return result.rows;
    }

    // Subscribe to status page
    async subscribe(statusPageId, subscriberData) {
        const { email, phone, slack_webhook, notification_type = 'email' } = subscriberData;

        const result = await db.query(
            `INSERT INTO status_page_subscribers
             (status_page_id, email, phone, slack_webhook, notification_type, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, true, NOW())
             RETURNING *`,
            [statusPageId, email, phone, slack_webhook, notification_type]
        );

        // Send confirmation email
        if (email && notification_type === 'email') {
            await this.sendSubscriptionConfirmation(email, result.rows[0]);
        }

        return result.rows[0];
    }

    // Unsubscribe from status page
    async unsubscribe(subscriberId) {
        await db.query(
            'UPDATE status_page_subscribers SET is_active = false WHERE id = $1',
            [subscriberId]
        );
    }

    // Notify all subscribers
    async notifySubscribers(componentId, status, message) {
        try {
            // Get component and status page info
            const component = await db.query(
                `SELECT c.*, sp.name as status_page_name
                 FROM status_page_components c
                 JOIN status_pages_v2 sp ON c.status_page_id = sp.id
                 WHERE c.id = $1`,
                [componentId]
            );

            if (component.rows.length === 0) return;

            const comp = component.rows[0];

            // Get all active subscribers
            const subscribers = await db.query(
                'SELECT * FROM status_page_subscribers WHERE status_page_id = $1 AND is_active = true',
                [comp.status_page_id]
            );

            // Send notifications
            for (const subscriber of subscribers.rows) {
                try {
                    if (subscriber.notification_type === 'email' && subscriber.email) {
                        await this.sendStatusEmail(subscriber.email, comp, status, message);
                    } else if (subscriber.notification_type === 'slack' && subscriber.slack_webhook) {
                        await this.sendSlackNotification(subscriber.slack_webhook, comp, status, message);
                    } else if (subscriber.notification_type === 'sms' && subscriber.phone) {
                        // Would integrate with Twilio
                        console.log('SMS notification to:', subscriber.phone);
                    }
                } catch (err) {
                    console.error('Failed to notify subscriber:', err);
                }
            }

            console.log(`✅ Notified ${subscribers.rows.length} subscribers`);

        } catch (error) {
            console.error('Error notifying subscribers:', error);
        }
    }

    // Send status update email
    async sendStatusEmail(email, component, status, message) {
        const statusText = {
            degraded: 'Degraded Performance',
            partial_outage: 'Partial Outage',
            major_outage: 'Major Outage',
            maintenance: 'Maintenance'
        }[status] || status;

        await emailService.sendEmail({
            to: email,
            subject: `${component.status_page_name} - ${component.name}: ${statusText}`,
            html: `
                <h2>${component.name} - ${statusText}</h2>
                <p>${message || 'We are investigating an issue affecting this component.'}</p>
                <p>We will provide updates as we learn more.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                    You are receiving this because you subscribed to ${component.status_page_name}.
                    <a href="${process.env.FRONTEND_URL}/status/unsubscribe/${email}">Unsubscribe</a>
                </p>
            `
        });
    }

    // Send Slack notification
    async sendSlackNotification(webhook, component, status, message) {
        const axios = require('axios');
        
        const color = {
            degraded: '#FFA500',
            partial_outage: '#FF0000',
            major_outage: '#FF0000',
            maintenance: '#0000FF'
        }[status] || '#808080';

        await axios.post(webhook, {
            attachments: [{
                color,
                title: `${component.name} - ${status}`,
                text: message,
                footer: component.status_page_name,
                ts: Math.floor(Date.now() / 1000)
            }]
        });
    }

    // Detect traffic spike (users checking status page)
    async trackPageView(statusPageId) {
        await db.query(
            `INSERT INTO status_page_views (status_page_id, viewed_at)
             VALUES ($1, NOW())`,
            [statusPageId]
        );

        // Check for spike
        await this.checkTrafficSpike(statusPageId);
    }

    // Check for traffic spike
    async checkTrafficSpike(statusPageId) {
        // Get views in last 5 minutes
        const recent = await db.query(
            `SELECT COUNT(*) as count
             FROM status_page_views
             WHERE status_page_id = $1
             AND viewed_at >= NOW() - INTERVAL '5 minutes'`,
            [statusPageId]
        );

        // Get baseline (average views per 5min over last day)
        const baseline = await db.query(
            `SELECT COUNT(*) / 288 as avg_count
             FROM status_page_views
             WHERE status_page_id = $1
             AND viewed_at >= NOW() - INTERVAL '24 hours'`,
            [statusPageId]
        );

        const currentViews = parseInt(recent.rows[0].count);
        const avgViews = parseFloat(baseline.rows[0].avg_count) || 1;

        // If current > 3x average, alert
        if (currentViews > avgViews * 3) {
            console.log(`⚠️ Traffic spike detected: ${currentViews} views (baseline: ${avgViews})`);
            // Would page on-call team
        }
    }

    // Post incident to status page
    async postIncident(statusPageId, incidentData) {
        const { title, message, severity, affected_components } = incidentData;

        const result = await db.query(
            `INSERT INTO status_page_incidents_v2
             (status_page_id, title, message, severity, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [statusPageId, title, message, severity]
        );

        const incidentId = result.rows[0].id;

        // Link affected components
        if (affected_components && affected_components.length > 0) {
            for (const componentId of affected_components) {
                await db.query(
                    'INSERT INTO incident_affected_components (incident_id, component_id) VALUES ($1, $2)',
                    [incidentId, componentId]
                );

                // Update component status
                await this.updateComponentStatus(componentId, 'degraded', title);
            }
        }

        // Notify subscribers
        await this.notifySubscribers(affected_components[0], 'incident', message);

        return result.rows[0];
    }

    // Custom branding
    async updateBranding(statusPageId, branding) {
        const { logo_url, primary_color, custom_domain, remove_powered_by } = branding;

        await db.query(
            'UPDATE status_pages_v2 SET branding = $1, custom_domain = $2, updated_at = NOW() WHERE id = $3',
            [JSON.stringify({ logo_url, primary_color, remove_powered_by }), custom_domain, statusPageId]
        );
    }
}

module.exports = new AdvancedStatusPages();
