// src/automation/workflowEngine.js
// Workflow Automation Engine for Tier 3

const db = require('../config/database');
const slackIntegration = require('../integrations/slack');
const emailService = require('../services/email');

class WorkflowEngine {
    constructor() {
        this.workflows = new Map();
        this.loadWorkflows();
    }

    async loadWorkflows() {
        // Load workflows from database
        const query = 'SELECT * FROM workflows WHERE is_active = true';
        const result = await db.query(query);
        
        result.rows.forEach(workflow => {
            this.workflows.set(workflow.id, workflow);
        });
    }

    // Execute workflow when triggered
    async executeWorkflow(workflowId, context) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error('Workflow not found');
        }

        console.log(`Executing workflow: ${workflow.name}`);

        try {
            const steps = JSON.parse(workflow.definition);
            let workflowContext = { ...context };

            for (const step of steps) {
                workflowContext = await this.executeStep(step, workflowContext);
                
                // Check if workflow should stop
                if (workflowContext._stop) {
                    break;
                }
            }

            return {
                success: true,
                workflowId,
                context: workflowContext
            };
        } catch (error) {
            console.error('Workflow execution error:', error);
            throw error;
        }
    }

    async executeStep(step, context) {
        const { type, config } = step;

        switch (type) {
            case 'condition':
                return await this.evaluateCondition(config, context);
            
            case 'auto_assign':
                return await this.autoAssignIncident(config, context);
            
            case 'escalate':
                return await this.escalateIncident(config, context);
            
            case 'notify':
                return await this.sendNotification(config, context);
            
            case 'update_status':
                return await this.updateIncidentStatus(config, context);
            
            case 'tag':
                return await this.tagIncident(config, context);
            
            case 'create_ticket':
                return await this.createExternalTicket(config, context);
            
            case 'run_script':
                return await this.runRemediationScript(config, context);
            
            case 'wait':
                return await this.waitStep(config, context);
            
            default:
                console.warn(`Unknown step type: ${type}`);
                return context;
        }
    }

    async evaluateCondition(config, context) {
        const { field, operator, value } = config;
        const actualValue = this.getContextValue(context, field);

        let conditionMet = false;

        switch (operator) {
            case 'equals':
                conditionMet = actualValue === value;
                break;
            case 'not_equals':
                conditionMet = actualValue !== value;
                break;
            case 'contains':
                conditionMet = actualValue.includes(value);
                break;
            case 'greater_than':
                conditionMet = actualValue > value;
                break;
            case 'less_than':
                conditionMet = actualValue < value;
                break;
        }

        return {
            ...context,
            _conditionMet: conditionMet,
            _stop: config.stopIfFalse && !conditionMet
        };
    }

    async autoAssignIncident(config, context) {
        const { strategy } = config;
        const incident = context.incident;

        let assigneeId;

        switch (strategy) {
            case 'round_robin':
                assigneeId = await this.getRoundRobinAssignee(incident.service_id);
                break;
            
            case 'least_busy':
                assigneeId = await this.getLeastBusyEngineer();
                break;
            
            case 'on_call':
                assigneeId = await this.getCurrentOnCall(incident.service_id);
                break;
            
            case 'expertise':
                assigneeId = await this.getExpertForIncident(incident);
                break;
        }

        if (assigneeId) {
            await db.query(
                'INSERT INTO incident_assignees (incident_id, user_id) VALUES ($1, $2)',
                [incident.id, assigneeId]
            );
            
            console.log(`Auto-assigned incident ${incident.id} to user ${assigneeId}`);
        }

        return { ...context, assigneeId };
    }

    async escalateIncident(config, context) {
        const { escalateTo, delay } = config;
        const incident = context.incident;

        // Check if incident should be escalated
        const createdAt = new Date(incident.created_at);
        const now = new Date();
        const minutesSinceCreated = (now - createdAt) / (1000 * 60);

        if (minutesSinceCreated >= delay) {
            // Update incident severity or status
            await db.query(
                'UPDATE incidents SET severity = $1 WHERE id = $2',
                [escalateTo, incident.id]
            );

            // Notify escalation team
            await this.sendNotification({
                type: 'escalation',
                recipients: config.notifyUsers
            }, context);

            console.log(`Escalated incident ${incident.id} to ${escalateTo}`);
        }

        return context;
    }

    async sendNotification(config, context) {
        const { type, channel, message } = config;
        const incident = context.incident;

        const notificationMessage = this.interpolateMessage(message, context);

        switch (type) {
            case 'slack':
                await slackIntegration.sendIncidentNotification({
                    ...incident,
                    title: notificationMessage
                }, channel);
                break;
            
            case 'email':
                if (config.recipients) {
                    await emailService.sendIncidentAlert(incident, config.recipients);
                }
                break;
            
            case 'sms':
                // Would integrate with Twilio
                console.log('SMS notification:', notificationMessage);
                break;
        }

        return context;
    }

    async updateIncidentStatus(config, context) {
        const { status } = config;
        const incident = context.incident;

        await db.query(
            'UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, incident.id]
        );

        return { ...context, incident: { ...incident, status } };
    }

    async tagIncident(config, context) {
        const { tags } = config;
        const incident = context.incident;

        // Add tags to incident (would need tags table)
        console.log(`Tagged incident ${incident.id} with:`, tags);

        return context;
    }

    async createExternalTicket(config, context) {
        const { system, project } = config;
        const incident = context.incident;

        // Would integrate with Jira, ServiceNow, etc.
        console.log(`Creating ${system} ticket for incident ${incident.id}`);

        return context;
    }

    async runRemediationScript(config, context) {
        const { scriptId } = config;
        
        // Execute pre-defined remediation script
        console.log(`Running remediation script: ${scriptId}`);

        return context;
    }

    async waitStep(config, context) {
        const { duration } = config;
        
        // In production, this would use a job queue
        await new Promise(resolve => setTimeout(resolve, duration * 1000));

        return context;
    }

    // Helper methods
    getContextValue(context, path) {
        return path.split('.').reduce((obj, key) => obj?.[key], context);
    }

    interpolateMessage(template, context) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return this.getContextValue(context, key) || match;
        });
    }

    async getRoundRobinAssignee(serviceId) {
        const query = `
            SELECT u.id 
            FROM users u
            JOIN team_members tm ON u.id = tm.user_id
            JOIN services s ON tm.team_id = s.id
            WHERE s.id = $1
            ORDER BY (
                SELECT COUNT(*) 
                FROM incident_assignees ia 
                WHERE ia.user_id = u.id
            ) ASC
            LIMIT 1
        `;
        
        const result = await db.query(query, [serviceId]);
        return result.rows[0]?.id;
    }

    async getLeastBusyEngineer() {
        const query = `
            SELECT u.id
            FROM users u
            LEFT JOIN incident_assignees ia ON u.id = ia.user_id
            LEFT JOIN incidents i ON ia.incident_id = i.id AND i.status != 'resolved'
            GROUP BY u.id
            ORDER BY COUNT(i.id) ASC
            LIMIT 1
        `;
        
        const result = await db.query(query);
        return result.rows[0]?.id;
    }

    async getCurrentOnCall(serviceId) {
        const query = `
            SELECT os.user_id
            FROM oncall_shifts os
            JOIN oncall_schedules osc ON os.schedule_id = osc.id
            WHERE NOW() BETWEEN os.start_time AND os.end_time
                AND osc.is_active = true
            LIMIT 1
        `;
        
        const result = await db.query(query);
        return result.rows[0]?.user_id;
    }

    async getExpertForIncident(incident) {
        // Simple heuristic: find user who resolved most similar incidents
        const query = `
            SELECT ia.user_id, COUNT(*) as resolved_count
            FROM incident_assignees ia
            JOIN incidents i ON ia.incident_id = i.id
            WHERE i.service_id = $1
                AND i.status = 'resolved'
            GROUP BY ia.user_id
            ORDER BY resolved_count DESC
            LIMIT 1
        `;
        
        const result = await db.query(query, [incident.service_id]);
        return result.rows[0]?.user_id;
    }

    // Trigger workflows based on events
    async triggerWorkflows(event, data) {
        const applicableWorkflows = Array.from(this.workflows.values())
            .filter(w => w.trigger_event === event && w.is_active);

        for (const workflow of applicableWorkflows) {
            try {
                await this.executeWorkflow(workflow.id, { [event]: data });
            } catch (error) {
                console.error(`Failed to execute workflow ${workflow.id}:`, error);
            }
        }
    }
}

module.exports = new WorkflowEngine();
