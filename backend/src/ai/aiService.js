// src/ai/aiService.js
// AI-Powered Features using OpenAI GPT-4

const axios = require('axios');
const db = require('../config/database');

class AIService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = 'gpt-4-turbo-preview';
    }

    async classifyIncident(title, description) {
        try {
            const prompt = `Analyze this incident and classify it:

Title: ${title}
Description: ${description}

Provide:
1. Suggested severity (SEV1, SEV2, SEV3, or SEV4)
2. Category (database, network, application, security, infrastructure)
3. Urgency score (1-10)
4. Brief reasoning

Format as JSON:
{
  "severity": "SEV1|SEV2|SEV3|SEV4",
  "category": "string",
  "urgency": number,
  "reasoning": "string"
}`;

            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('AI classification error:', error);
            return null;
        }
    }

    async suggestRootCause(incident) {
        try {
            // Get similar past incidents
            const similarIncidents = await this.findSimilarIncidents(incident);
            
            const prompt = `Analyze this incident and suggest potential root causes:

Current Incident:
Title: ${incident.title}
Description: ${incident.description}
Service: ${incident.service_name || 'Unknown'}

Similar Past Incidents:
${similarIncidents.map(i => `- ${i.title}: Root cause was ${i.root_cause || 'unspecified'}`).join('\n')}

Based on patterns, suggest 3 most likely root causes with confidence scores.

Format as JSON:
{
  "causes": [
    {"cause": "string", "confidence": number, "evidence": "string"}
  ]
}`;

            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Root cause analysis error:', error);
            return null;
        }
    }

    async generatePostMortem(incident, updates) {
        try {
            const prompt = `Generate a post-mortem document for this incident:

Incident: ${incident.incident_number}
Title: ${incident.title}
Severity: ${incident.severity}
Duration: ${this.calculateDuration(incident)}

Timeline:
${updates.map(u => `- ${u.created_at}: ${u.message}`).join('\n')}

Generate a structured post-mortem with:
1. Executive Summary
2. Timeline
3. Root Cause Analysis
4. Impact Assessment
5. Action Items
6. Lessons Learned

Use clear, professional language.`;

            const response = await this.callOpenAI(prompt, 2000);
            return response;
        } catch (error) {
            console.error('Post-mortem generation error:', error);
            return null;
        }
    }

    async chatbot(query, context = {}) {
        try {
            const prompt = `You are an incident management AI assistant. Answer this query:

Query: ${query}

Context:
${JSON.stringify(context, null, 2)}

Provide helpful, actionable information. If you need more details, ask.`;

            const response = await this.callOpenAI(prompt, 500);
            return response;
        } catch (error) {
            console.error('Chatbot error:', error);
            return "I'm having trouble processing that request. Please try again.";
        }
    }

    async predictMTTR(incident) {
        try {
            // Get historical data
            const historicalQuery = `
                SELECT 
                    severity,
                    service_id,
                    EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 as resolution_hours
                FROM incidents
                WHERE status = 'resolved'
                    AND severity = $1
                ORDER BY created_at DESC
                LIMIT 50
            `;
            
            const result = await db.query(historicalQuery, [incident.severity]);
            const avgHours = result.rows.reduce((sum, row) => sum + row.resolution_hours, 0) / result.rows.length;

            const prompt = `Predict resolution time for this incident:

Incident Details:
- Severity: ${incident.severity}
- Service: ${incident.service_name}
- Time of Day: ${new Date().getHours()}:00
- Day of Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

Historical Average for ${incident.severity}: ${avgHours.toFixed(1)} hours

Based on these factors, estimate resolution time (in hours) and confidence level.

Format as JSON:
{
  "estimated_hours": number,
  "confidence": number (0-100),
  "factors": ["factor1", "factor2"]
}`;

            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('MTTR prediction error:', error);
            return null;
        }
    }

    async findSimilarIncidents(incident, limit = 5) {
        try {
            // Simple similarity based on title/description keywords
            // In production, would use embeddings
            const query = `
                SELECT 
                    id,
                    incident_number,
                    title,
                    severity,
                    status,
                    created_at
                FROM incidents
                WHERE id != $1
                    AND (
                        title ILIKE '%' || $2 || '%'
                        OR description ILIKE '%' || $2 || '%'
                    )
                ORDER BY created_at DESC
                LIMIT $3
            `;
            
            const keywords = incident.title.split(' ').slice(0, 3).join(' ');
            const result = await db.query(query, [incident.id, keywords, limit]);
            
            return result.rows;
        } catch (error) {
            console.error('Similar incidents error:', error);
            return [];
        }
    }

    async smartTag(incident) {
        try {
            const prompt = `Generate relevant tags for this incident:

Title: ${incident.title}
Description: ${incident.description}

Suggest 3-5 relevant tags (lowercase, hyphenated).

Format as JSON array: ["tag-1", "tag-2", "tag-3"]`;

            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Smart tagging error:', error);
            return [];
        }
    }

    async generateDocumentation(topic, context) {
        try {
            const prompt = `Generate technical documentation for:

Topic: ${topic}
Context: ${JSON.stringify(context)}

Create clear, structured documentation with:
- Overview
- Prerequisites
- Step-by-step guide
- Common issues
- Best practices

Use markdown formatting.`;

            const response = await this.callOpenAI(prompt, 1500);
            return response;
        } catch (error) {
            console.error('Documentation generation error:', error);
            return null;
        }
    }

    async suggestResponseActions(incident) {
        try {
            const prompt = `Suggest immediate response actions for this incident:

Severity: ${incident.severity}
Title: ${incident.title}
Service: ${incident.service_name || 'Unknown'}

List 3-5 prioritized actions the team should take right now.

Format as JSON:
{
  "actions": [
    {"priority": number, "action": "string", "reasoning": "string"}
  ]
}`;

            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Action suggestion error:', error);
            return null;
        }
    }

    // Core OpenAI API call
    async callOpenAI(prompt, maxTokens = 1000) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert incident management AI assistant. Provide accurate, actionable insights.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    }

    calculateDuration(incident) {
        if (incident.resolved_at) {
            const duration = new Date(incident.resolved_at) - new Date(incident.created_at);
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        return 'Ongoing';
    }
}

module.exports = new AIService();
