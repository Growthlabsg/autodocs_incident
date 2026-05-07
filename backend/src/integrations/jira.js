// src/integrations/jira.js
// Jira Bidirectional Integration

const axios = require('axios');

class JiraIntegration {
    constructor() {
        this.baseUrl = process.env.JIRA_BASE_URL; // e.g., https://yourcompany.atlassian.net
        this.email = process.env.JIRA_EMAIL;
        this.apiToken = process.env.JIRA_API_TOKEN;
        this.projectKey = process.env.JIRA_PROJECT_KEY || 'INC';
        
        this.client = axios.create({
            baseURL: `${this.baseUrl}/rest/api/3`,
            auth: {
                username: this.email,
                password: this.apiToken
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async createIssue(incident) {
        try {
            const response = await this.client.post('/issue', {
                fields: {
                    project: { key: this.projectKey },
                    summary: `[${incident.severity}] ${incident.title}`,
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: incident.description
                            }]
                        }]
                    },
                    issuetype: { name: 'Bug' },
                    priority: { name: this.mapSeverityToPriority(incident.severity) },
                    labels: ['incident', incident.severity.toLowerCase()]
                }
            });

            console.log('✅ Jira issue created:', response.data.key);
            return response.data;
        } catch (error) {
            console.error('❌ Jira create failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateIssue(jiraKey, incident) {
        try {
            await this.client.put(`/issue/${jiraKey}`, {
                fields: {
                    summary: `[${incident.severity}] ${incident.title}`,
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: incident.description
                            }]
                        }]
                    }
                }
            });

            console.log('✅ Jira issue updated:', jiraKey);
        } catch (error) {
            console.error('❌ Jira update failed:', error.response?.data || error.message);
        }
    }

    async addComment(jiraKey, comment) {
        try {
            await this.client.post(`/issue/${jiraKey}/comment`, {
                body: {
                    type: 'doc',
                    version: 1,
                    content: [{
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: comment
                        }]
                    }]
                }
            });

            console.log('✅ Jira comment added');
        } catch (error) {
            console.error('❌ Jira comment failed:', error.response?.data || error.message);
        }
    }

    async transitionIssue(jiraKey, transitionName) {
        try {
            // Get available transitions
            const transitions = await this.client.get(`/issue/${jiraKey}/transitions`);
            const transition = transitions.data.transitions.find(t => 
                t.name.toLowerCase() === transitionName.toLowerCase()
            );

            if (transition) {
                await this.client.post(`/issue/${jiraKey}/transitions`, {
                    transition: { id: transition.id }
                });
                console.log('✅ Jira issue transitioned');
            }
        } catch (error) {
            console.error('❌ Jira transition failed:', error.response?.data || error.message);
        }
    }

    mapSeverityToPriority(severity) {
        const map = {
            'SEV1': 'Highest',
            'SEV2': 'High',
            'SEV3': 'Medium',
            'SEV4': 'Low'
        };
        return map[severity] || 'Medium';
    }

    async syncFromJira(jiraKey) {
        try {
            const response = await this.client.get(`/issue/${jiraKey}`);
            return {
                key: response.data.key,
                summary: response.data.fields.summary,
                status: response.data.fields.status.name,
                priority: response.data.fields.priority.name
            };
        } catch (error) {
            console.error('❌ Jira sync failed:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new JiraIntegration();
