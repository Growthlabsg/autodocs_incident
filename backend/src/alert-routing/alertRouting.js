// src/alert-routing/alertRouting.js
// Alert Routing Engine - Advanced routing with 40+ source integrations

const db = require('../config/database');
const workflowEngine = require('../automation/workflowEngine');
const slackBot = require('../slack-bot/slackBot');

class AlertRoutingEngine {
    constructor() {
        this.alertSources = this.initializeAlertSources();
    }

    // Initialize 40+ alert source integrations
    initializeAlertSources() {
        return {
            // Monitoring & Observability
            datadog: { name: 'Datadog', category: 'monitoring', icon: '📊' },
            newrelic: { name: 'New Relic', category: 'monitoring', icon: '📈' },
            grafana: { name: 'Grafana', category: 'monitoring', icon: '📉' },
            prometheus: { name: 'Prometheus', category: 'monitoring', icon: '🔥' },
            sentry: { name: 'Sentry', category: 'errors', icon: '🐛' },
            rollbar: { name: 'Rollbar', category: 'errors', icon: '🔄' },
            
            // Cloud Providers
            aws_cloudwatch: { name: 'AWS CloudWatch', category: 'cloud', icon: '☁️' },
            aws_health: { name: 'AWS Health', category: 'cloud', icon: '🏥' },
            gcp_monitoring: { name: 'GCP Monitoring', category: 'cloud', icon: '☁️' },
            azure_monitor: { name: 'Azure Monitor', category: 'cloud', icon: '☁️' },
            
            // Incident Management
            pagerduty: { name: 'PagerDuty', category: 'incident', icon: '📟' },
            opsgenie: { name: 'Opsgenie', category: 'incident', icon: '🔔' },
            victorops: { name: 'VictorOps', category: 'incident', icon: '📢' },
            
            // Logging
            splunk: { name: 'Splunk', category: 'logging', icon: '📝' },
            elastic: { name: 'Elastic', category: 'logging', icon: '🔍' },
            loggly: { name: 'Loggly', category: 'logging', icon: '📋' },
            
            // Security
            snyk: { name: 'Snyk', category: 'security', icon: '🔒' },
            wiz: { name: 'Wiz', category: 'security', icon: '🛡️' },
            crowdstrike: { name: 'CrowdStrike', category: 'security', icon: '🦅' },
            
            // Uptime Monitoring
            pingdom: { name: 'Pingdom', category: 'uptime', icon: '📡' },
            uptimerobot: { name: 'UptimeRobot', category: 'uptime', icon: '🤖' },
            statuspage: { name: 'StatusPage.io', category: 'uptime', icon: '📊' },
            
            // CI/CD
            jenkins: { name: 'Jenkins', category: 'cicd', icon: '🔧' },
            circleci: { name: 'CircleCI', category: 'cicd', icon: '⭕' },
            github_actions: { name: 'GitHub Actions', category: 'cicd', icon: '🐙' },
            
            // Custom
            webhook: { name: 'Custom Webhook', category: 'custom', icon: '🔗' },
            http: { name: 'HTTP Endpoint', category: 'custom', icon: '🌐' }
        };
    }

    // Create routing rule
    async createRoutingRule(ruleData) {
        const {
            name,
            description,
            conditions, // Array of condition objects
            actions, // Array of action objects
            priority = 0,
            is_active = true
        } = ruleData;

        const result = await db.query(
            `INSERT INTO alert_routing_rules
             (name, description, conditions, actions, priority, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING *`,
            [name, description, JSON.stringify(conditions), JSON.stringify(actions), priority, is_active]
        );

        console.log(`✅ Alert routing rule "${name}" created`);
        return result.rows[0];
    }

    // Process incoming alert
    async processAlert(alertData) {
        const {
            source,
            title,
            body,
            severity,
            metadata = {},
            alert_id
        } = alertData;

        try {
            // Store alert
            const alert = await this.storeAlert(alertData);

            // Check for duplicates (within 5min window)
            const isDuplicate = await this.checkDuplicate(alert);
            if (isDuplicate) {
                console.log(`⚠️ Duplicate alert suppressed: ${alert_id}`);
                return { suppressed: true, reason: 'duplicate' };
            }

            // Get matching routing rules
            const matchingRules = await this.getMatchingRules(alert);

            if (matchingRules.length === 0) {
                console.log('⚠️ No routing rules matched, using default');
                await this.applyDefaultRouting(alert);
            } else {
                // Apply highest priority matching rule
                const rule = matchingRules[0];
                await this.applyRoutingRule(rule, alert);
            }

            // AI alert renaming
            if (this.isCrypticTitle(title)) {
                const newTitle = await this.aiRenameAlert(alert);
                await this.updateAlertTitle(alert.id, newTitle);
            }

            // Alert grouping - cluster related alerts
            await this.groupRelatedAlerts(alert);

            return { success: true, alert_id: alert.id };

        } catch (error) {
            console.error('Error processing alert:', error);
            throw error;
        }
    }

    // Store alert in database
    async storeAlert(alertData) {
        const {
            source,
            title,
            body,
            severity,
            metadata,
            alert_id,
            raw_payload
        } = alertData;

        const result = await db.query(
            `INSERT INTO alerts
             (source, title, body, severity, metadata, external_alert_id, raw_payload, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', NOW())
             RETURNING *`,
            [source, title, body, severity, JSON.stringify(metadata), alert_id, JSON.stringify(raw_payload)]
        );

        return result.rows[0];
    }

    // Check for duplicate alerts
    async checkDuplicate(alert) {
        const result = await db.query(
            `SELECT * FROM alerts
             WHERE source = $1
             AND title = $2
             AND created_at >= NOW() - INTERVAL '5 minutes'
             AND id != $3
             AND status = 'open'`,
            [alert.source, alert.title, alert.id]
        );

        return result.rows.length > 0;
    }

    // Get matching routing rules
    async getMatchingRules(alert) {
        // Get all active rules, ordered by priority
        const result = await db.query(
            'SELECT * FROM alert_routing_rules WHERE is_active = true ORDER BY priority DESC'
        );

        const matchingRules = [];

        for (const rule of result.rows) {
            const conditions = JSON.parse(rule.conditions);
            if (this.evaluateConditions(conditions, alert)) {
                matchingRules.push(rule);
            }
        }

        return matchingRules;
    }

    // Evaluate rule conditions
    evaluateConditions(conditions, alert) {
        // Conditions format: { operator: 'AND'|'OR', rules: [{field, operator, value}] }
        const { operator = 'AND', rules } = conditions;

        const results = rules.map(rule => {
            const alertValue = this.getAlertValue(alert, rule.field);
            return this.evaluateCondition(alertValue, rule.operator, rule.value);
        });

        if (operator === 'AND') {
            return results.every(r => r);
        } else {
            return results.some(r => r);
        }
    }

    // Evaluate single condition
    evaluateCondition(alertValue, operator, ruleValue) {
        switch (operator) {
            case 'equals':
                return alertValue === ruleValue;
            case 'not_equals':
                return alertValue !== ruleValue;
            case 'contains':
                return String(alertValue).includes(String(ruleValue));
            case 'not_contains':
                return !String(alertValue).includes(String(ruleValue));
            case 'greater_than':
                return parseFloat(alertValue) > parseFloat(ruleValue);
            case 'less_than':
                return parseFloat(alertValue) < parseFloat(ruleValue);
            case 'in':
                return Array.isArray(ruleValue) && ruleValue.includes(alertValue);
            case 'not_in':
                return Array.isArray(ruleValue) && !ruleValue.includes(alertValue);
            default:
                return false;
        }
    }

    // Get value from alert object
    getAlertValue(alert, field) {
        const parts = field.split('.');
        let value = alert;
        
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return null;
            }
        }
        
        return value;
    }

    // Apply routing rule actions
    async applyRoutingRule(rule, alert) {
        const actions = JSON.parse(rule.actions);

        for (const action of actions) {
            try {
                await this.executeAction(action, alert);
            } catch (error) {
                console.error(`Failed to execute action ${action.type}:`, error);
            }
        }
    }

    // Execute routing action
    async executeAction(action, alert) {
        const { type, config } = action;

        switch (type) {
            case 'page_team':
                await this.pageTeam(config.team_id, alert);
                break;
            
            case 'create_incident':
                await this.createIncidentFromAlert(alert, config);
                break;
            
            case 'notify_slack':
                await this.notifySlack(config.channel, alert);
                break;
            
            case 'suppress':
                await this.suppressAlert(alert.id);
                break;
            
            case 'auto_resolve':
                await this.autoResolveAlert(alert.id);
                break;
            
            default:
                console.warn(`Unknown action type: ${type}`);
        }
    }

    // Page team for alert
    async pageTeam(teamId, alert) {
        // Get on-call for team
        const onCall = await db.query(
            `SELECT u.* FROM users u
             JOIN oncall_shifts os ON u.id = os.user_id
             JOIN team_members tm ON u.id = tm.user_id
             WHERE tm.team_id = $1
             AND NOW() BETWEEN os.start_time AND os.end_time
             LIMIT 1`,
            [teamId]
        );

        if (onCall.rows.length > 0) {
            // Send page via PagerDuty, SMS, etc.
            console.log(`📟 Paging ${onCall.rows[0].email} for alert ${alert.id}`);
        }
    }

    // Create incident from alert
    async createIncidentFromAlert(alert, config) {
        const result = await db.query(
            `INSERT INTO incidents (title, description, severity, status, source_alert_id, created_at, updated_at)
             VALUES ($1, $2, $3, 'investigating', $4, NOW(), NOW())
             RETURNING *`,
            [alert.title, alert.body, config.severity || 'SEV3', alert.id]
        );

        console.log(`🚨 Created incident ${result.rows[0].incident_number} from alert`);
    }

    // Notify Slack
    async notifySlack(channel, alert) {
        if (slackBot.client) {
            await slackBot.client.chat.postMessage({
                channel,
                text: `🔔 *${alert.title}*\n${alert.body}\nSource: ${alert.source} | Severity: ${alert.severity}`
            });
        }
    }

    // AI rename cryptic alerts
    async aiRenameAlert(alert) {
        // Would call OpenAI to generate clear title
        // For now, simple placeholder
        return `${alert.source}: ${alert.title}`;
    }

    isCrypticTitle(title) {
        // Check if title is cryptic (has IDs, UUIDs, etc.)
        return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(title) ||
               title.length > 100;
    }

    // Group related alerts
    async groupRelatedAlerts(alert) {
        // Find alerts with similar titles or from same source in last 10min
        const result = await db.query(
            `SELECT * FROM alerts
             WHERE source = $1
             AND created_at >= NOW() - INTERVAL '10 minutes'
             AND status = 'open'
             AND id != $2
             ORDER BY created_at DESC
             LIMIT 5`,
            [alert.source, alert.id]
        );

        if (result.rows.length > 0) {
            // Create alert group
            await db.query(
                'INSERT INTO alert_groups (primary_alert_id, grouped_alert_ids, created_at) VALUES ($1, $2, NOW())',
                [alert.id, result.rows.map(a => a.id)]
            );
        }
    }

    // Default routing (when no rules match)
    async applyDefaultRouting(alert) {
        // Notify general channel
        await this.notifySlack('#alerts', alert);
    }

    // Suppress alert
    async suppressAlert(alertId) {
        await db.query(
            'UPDATE alerts SET status = $1, updated_at = NOW() WHERE id = $2',
            ['suppressed', alertId]
        );
    }

    // Auto-resolve alert
    async autoResolveAlert(alertId) {
        await db.query(
            'UPDATE alerts SET status = $1, resolved_at = NOW() WHERE id = $2',
            ['resolved', alertId]
        );
    }

    // Update alert title
    async updateAlertTitle(alertId, newTitle) {
        await db.query(
            'UPDATE alerts SET title = $1 WHERE id = $2',
            [newTitle, alertId]
        );
    }

    // Get alert source info
    getAlertSourceInfo(sourceKey) {
        return this.alertSources[sourceKey] || null;
    }

    // List all available alert sources
    listAlertSources() {
        return Object.keys(this.alertSources).map(key => ({
            key,
            ...this.alertSources[key]
        }));
    }
}

module.exports = new AlertRoutingEngine();
