// src/integrations/github.js
// GitHub Integration

const axios = require('axios');

class GitHubIntegration {
    constructor() {
        this.token = process.env.GITHUB_TOKEN;
        this.client = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
    }

    async createIssue(repo, incident) {
        try {
            const [owner, repoName] = repo.split('/');
            
            const response = await this.client.post(`/repos/${owner}/${repoName}/issues`, {
                title: `[${incident.severity}] ${incident.title}`,
                body: `## Incident Details\n\n` +
                      `**Incident Number:** ${incident.incident_number}\n` +
                      `**Severity:** ${incident.severity}\n` +
                      `**Status:** ${incident.status}\n` +
                      `**Created:** ${incident.created_at}\n\n` +
                      `### Description\n${incident.description}\n\n` +
                      `[View in Platform](${process.env.FRONTEND_URL}/incidents/${incident.id})`,
                labels: ['incident', incident.severity.toLowerCase()]
            });

            console.log('✅ GitHub issue created:', response.data.number);
            return response.data;
        } catch (error) {
            console.error('❌ GitHub issue creation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async addComment(repo, issueNumber, comment) {
        try {
            const [owner, repoName] = repo.split('/');
            
            await this.client.post(`/repos/${owner}/${repoName}/issues/${issueNumber}/comments`, {
                body: comment
            });

            console.log('✅ GitHub comment added');
        } catch (error) {
            console.error('❌ GitHub comment failed:', error.response?.data || error.message);
        }
    }

    async closeIssue(repo, issueNumber) {
        try {
            const [owner, repoName] = repo.split('/');
            
            await this.client.patch(`/repos/${owner}/${repoName}/issues/${issueNumber}`, {
                state: 'closed'
            });

            console.log('✅ GitHub issue closed');
        } catch (error) {
            console.error('❌ GitHub close failed:', error.response?.data || error.message);
        }
    }
}

module.exports = new GitHubIntegration();
