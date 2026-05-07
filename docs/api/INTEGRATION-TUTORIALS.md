# 🎓 Integration Tutorials

Step-by-step guides for integrating AutoDocs+AutoIncident API

---

## 📋 Table of Contents

1. [Tutorial 1: First Integration (15 min)](#tutorial-1-first-integration)
2. [Tutorial 2: Slack Bot](#tutorial-2-slack-bot)
3. [Tutorial 3: Monitoring Integration](#tutorial-3-monitoring-integration)
4. [Tutorial 4: Status Page Widget](#tutorial-4-status-page-widget)
5. [Tutorial 5: On-Call Dashboard](#tutorial-5-on-call-dashboard)
6. [Tutorial 6: Custom Workflow](#tutorial-6-custom-workflow)

---

## 🚀 Tutorial 1: First Integration (15 min)

**Goal:** Create your first incident via API in 15 minutes

### Step 1: Get API Key (2 min)

1. Log into AutoDocs+AutoIncident
2. Go to **Settings → API Keys**
3. Click **Generate API Key**
4. Copy your key: `ad_live_abc123...`

### Step 2: Install SDK (2 min)

**JavaScript:**
```bash
npm install @autodocs/incident-sdk
```

**Python:**
```bash
pip install autodocs-incident
```

### Step 3: Create Your First Incident (5 min)

**JavaScript:**
```javascript
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

// Initialize
const client = new AutoIncidentClient({
  apiKey: 'ad_live_abc123...'
});

// Create incident
async function createIncident() {
  const incident = await client.incidents.create({
    title: 'My First API Incident',
    description: 'Testing the API integration',
    severity: 'SEV3',
    service_id: 10 // Replace with your service ID
  });
  
  console.log('✅ Incident created!');
  console.log('Incident Number:', incident.incident_number);
  console.log('URL:', `https://app.autodocs.com/incidents/${incident.id}`);
}

createIncident();
```

**Python:**
```python
from autodocs import AutoIncidentClient

# Initialize
client = AutoIncidentClient(api_key='ad_live_abc123...')

# Create incident
incident = client.incidents.create(
    title='My First API Incident',
    description='Testing the API integration',
    severity='SEV3',
    service_id=10  # Replace with your service ID
)

print('✅ Incident created!')
print(f'Incident Number: {incident.incident_number}')
print(f'URL: https://app.autodocs.com/incidents/{incident.id}')
```

### Step 4: Verify (1 min)

1. Run your code
2. Check the console for incident number
3. Visit the URL to see your incident

### Step 5: Update the Incident (5 min)

```javascript
// Update status
await client.incidents.update(incident.id, {
  status: 'monitoring'
});

// Post an update
await client.incidents.postUpdate(incident.id, {
  message: 'Issue is under control. Monitoring closely.',
  notify_channels: ['slack']
});

// Resolve
await client.incidents.resolve(incident.id, {
  resolution_summary: 'Test completed successfully',
  root_cause: 'This was a test'
});

console.log('✅ Incident lifecycle complete!');
```

**Congratulations! 🎉** You've successfully integrated with the API!

---

## 💬 Tutorial 2: Slack Bot

**Goal:** Build a Slack bot that creates incidents

### Prerequisites

- Slack workspace admin access
- Node.js installed
- AutoDocs API key

### Step 1: Create Slack App (10 min)

1. Go to https://api.slack.com/apps
2. Click **Create New App**
3. Choose **From scratch**
4. Name: "Incident Bot"
5. Select your workspace

### Step 2: Configure Slash Command

1. Go to **Slash Commands**
2. Click **Create New Command**
3. Command: `/incident`
4. Request URL: `https://your-server.com/slack/commands`
5. Description: "Create a new incident"
6. Save

### Step 3: Install Dependencies

```bash
npm init -y
npm install express @slack/bolt @autodocs/incident-sdk
```

### Step 4: Build the Bot

```javascript
// bot.js
const { App } = require('@slack/bolt');
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Initialize AutoDocs client
const incident Client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY
});

// Handle /incident command
app.command('/incident', async ({ command, ack, respond }) => {
  await ack();
  
  // Parse command text
  const text = command.text;
  
  try {
    // Create incident
    const incident = await incidentClient.incidents.create({
      title: text || 'Incident created from Slack',
      severity: 'SEV3',
      service_id: 10
    });
    
    // Respond in Slack
    await respond({
      text: `✅ Incident created: ${incident.incident_number}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Incident Created* 🚨\n\n*Number:* ${incident.incident_number}\n*Title:* ${incident.title}\n*Severity:* ${incident.severity}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Incident'
              },
              url: `https://app.autodocs.com/incidents/${incident.id}`
            }
          ]
        }
      ]
    });
  } catch (error) {
    await respond({
      text: `❌ Error: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
```

### Step 5: Environment Setup

```bash
# .env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
AUTODOCS_API_KEY=ad_live_abc123...
PORT=3000
```

### Step 6: Run the Bot

```bash
node bot.js
```

### Step 7: Test

In Slack, type:
```
/incident Database is running slow
```

You should see a confirmation with incident details!

### Step 8: Advanced Features

**Interactive Modal:**
```javascript
app.command('/incident', async ({ command, ack, client }) => {
  await ack();
  
  // Open modal
  await client.views.open({
    trigger_id: command.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'incident_modal',
      title: {
        type: 'plain_text',
        text: 'Create Incident'
      },
      submit: {
        type: 'plain_text',
        text: 'Create'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'title',
          label: {
            type: 'plain_text',
            text: 'Title'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'title_input'
          }
        },
        {
          type: 'input',
          block_id: 'severity',
          label: {
            type: 'plain_text',
            text: 'Severity'
          },
          element: {
            type: 'static_select',
            action_id: 'severity_select',
            options: [
              {
                text: { type: 'plain_text', text: 'SEV1 - Critical' },
                value: 'SEV1'
              },
              {
                text: { type: 'plain_text', text: 'SEV2 - High' },
                value: 'SEV2'
              },
              {
                text: { type: 'plain_text', text: 'SEV3 - Medium' },
                value: 'SEV3'
              }
            ]
          }
        }
      ]
    }
  });
});

// Handle modal submission
app.view('incident_modal', async ({ ack, body, view }) => {
  await ack();
  
  const values = view.state.values;
  const title = values.title.title_input.value;
  const severity = values.severity.severity_select.selected_option.value;
  
  // Create incident
  const incident = await incidentClient.incidents.create({
    title,
    severity,
    service_id: 10
  });
  
  // Notify channel
  // ... (notification code)
});
```

---

## 📊 Tutorial 3: Monitoring Integration

**Goal:** Automatically create incidents from Datadog alerts

### Step 1: Create Webhook Endpoint

```javascript
// monitoring-webhook.js
const express = require('express');
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

const app = express();
const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY
});

app.use(express.json());

// Datadog webhook endpoint
app.post('/webhooks/datadog', async (req, res) => {
  const alert = req.body;
  
  // Parse Datadog alert
  const severity = alert.priority === 'P1' ? 'SEV1' : 
                   alert.priority === 'P2' ? 'SEV2' : 'SEV3';
  
  try {
    // Create incident
    const incident = await client.incidents.create({
      title: alert.title,
      description: alert.body,
      severity,
      service_id: getServiceIdFromTags(alert.tags),
      custom_fields: {
        alert_id: alert.id,
        host: alert.host,
        priority: alert.priority
      }
    });
    
    console.log(`✅ Incident created: ${incident.incident_number}`);
    
    res.status(200).json({
      success: true,
      incident_id: incident.id,
      incident_number: incident.incident_number
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function
function getServiceIdFromTags(tags) {
  const serviceTag = tags.find(t => t.startsWith('service:'));
  // Map Datadog service tags to AutoDocs service IDs
  const serviceMap = {
    'service:web': 10,
    'service:api': 11,
    'service:db': 12
  };
  return serviceMap[serviceTag] || 10;
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Step 2: Configure Datadog

1. In Datadog, go to **Integrations → Webhooks**
2. Add new webhook:
   - **Name:** AutoDocs Incident
   - **URL:** `https://your-server.com/webhooks/datadog`
   - **Payload:** Use default

3. In your monitors, add `@webhook-autodocs-incident`

### Step 3: Test

Trigger a Datadog alert and watch incidents auto-create!

---

## 🌐 Tutorial 4: Status Page Widget

**Goal:** Embed live status on your website

### Step 1: Get Status Page ID

```javascript
const client = new AutoIncidentClient({ apiKey: 'your_key' });
const statusPages = await client.statusPages.list();
console.log(statusPages);
```

### Step 2: Create Widget HTML

```html
<!-- status-widget.html -->
<!DOCTYPE html>
<html>
<head>
  <title>System Status</title>
  <style>
    .status-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 600px;
      margin: 20px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    
    .component {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .operational { background: #d1fae5; color: #065f46; }
    .degraded { background: #fef3c7; color: #92400e; }
    .outage { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="status-widget">
    <h2>System Status</h2>
    <div id="components"></div>
  </div>

  <script>
    const API_URL = 'https://api.autodocs.com';
    const STATUS_PAGE_ID = 1; // Your status page ID

    async function loadStatus() {
      const response = await fetch(
        `${API_URL}/api/status-pages/${STATUS_PAGE_ID}/public`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      const data = await response.json();
      
      const componentsDiv = document.getElementById('components');
      componentsDiv.innerHTML = data.components.map(comp => `
        <div class="component">
          <span>${comp.name}</span>
          <span class="status-badge ${comp.status}">
            ${comp.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      `).join('');
    }

    // Load on page load
    loadStatus();
    
    // Refresh every 30 seconds
    setInterval(loadStatus, 30000);
  </script>
</body>
</html>
```

### Step 3: Embed on Your Site

```html
<!-- On your website -->
<iframe 
  src="https://your-site.com/status-widget.html"
  width="620"
  height="400"
  frameborder="0"
></iframe>
```

---

## 📱 Tutorial 5: On-Call Dashboard

**Goal:** Build a real-time on-call dashboard

### Step 1: Create React App

```bash
npx create-react-app oncall-dashboard
cd oncall-dashboard
npm install @autodocs/incident-sdk recharts
```

### Step 2: Build Dashboard

```jsx
// src/OnCallDashboard.js
import React, { useState, useEffect } from 'react';
import { AutoIncidentClient } from '@autodocs/incident-sdk';

const client = new AutoIncidentClient({
  apiKey: process.env.REACT_APP_AUTODOCS_API_KEY
});

function OnCallDashboard() {
  const [oncall, setOncall] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [oncallData, incidentData] = await Promise.all([
        client.oncall.current(),
        client.incidents.list({ status: 'investigating' })
      ]);
      
      setOncall(oncallData.oncall);
      setIncidents(incidentData.incidents);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>On-Call Dashboard</h1>
      
      {/* Current On-Call */}
      <section className="oncall-section">
        <h2>Currently On-Call</h2>
        {oncall.map(item => (
          <div key={item.team.id} className="oncall-card">
            <h3>{item.team.name}</h3>
            <div className="oncall-user">
              <strong>{item.user.first_name} {item.user.last_name}</strong>
              <span>{item.user.phone}</span>
            </div>
          </div>
        ))}
      </section>
      
      {/* Active Incidents */}
      <section className="incidents-section">
        <h2>Active Incidents ({incidents.length})</h2>
        {incidents.map(incident => (
          <div key={incident.id} className="incident-card">
            <span className={`severity ${incident.severity}`}>
              {incident.severity}
            </span>
            <div>
              <strong>{incident.incident_number}</strong>
              <p>{incident.title}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default OnCallDashboard;
```

### Step 3: Style It

```css
/* src/OnCallDashboard.css */
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.oncall-card {
  background: white;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.incident-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin: 10px 0;
}

.severity {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.severity.SEV1 {
  background: #fee2e2;
  color: #991b1b;
}

.severity.SEV2 {
  background: #fef3c7;
  color: #92400e;
}
```

---

## 🔄 Tutorial 6: Custom Workflow

**Goal:** Build a custom escalation workflow

### Scenario

Automatically escalate unassigned SEV1 incidents after 5 minutes.

### Step 1: Create Worker Script

```javascript
// escalation-worker.js
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY
});

async function checkEscalations() {
  // Get SEV1 incidents created in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const incidents = await client.incidents.list({
    severity: 'SEV1',
    status: 'investigating',
    created_after: tenMinutesAgo.toISOString()
  });
  
  for (const incident of incidents.incidents) {
    // Check if older than 5 minutes
    const createdAt = new Date(incident.created_at);
    const age = Date.now() - createdAt.getTime();
    
    if (age > 5 * 60 * 1000) {
      // Check if assigned
      if (incident.assignees.length === 0) {
        console.log(`⚠️ Escalating ${incident.incident_number}`);
        
        // Escalate
        await client.incidents.escalate(incident.id, {
          escalation_level: 2,
          reason: 'Unassigned after 5 minutes',
          notify_teams: [1, 2] // Notify leadership teams
        });
        
        console.log(`✅ Escalated ${incident.incident_number}`);
      }
    }
  }
}

// Run every minute
setInterval(checkEscalations, 60 * 1000);
checkEscalations(); // Run immediately

console.log('🔄 Escalation worker started');
```

### Step 2: Run as Service

```bash
# Using PM2
npm install -g pm2
pm2 start escalation-worker.js
pm2 save
```

---

## 📚 More Resources

- **API Documentation:** https://docs.autodocs.com
- **Code Examples:** https://github.com/autodocs/examples
- **Support:** api-support@autodocs.com
- **Community:** https://community.autodocs.com

---

**Next Steps:**

1. Try Tutorial 1 to get started
2. Pick a use case relevant to your team
3. Follow the step-by-step guide
4. Customize to your needs
5. Share your success story!

**Need Help?** Join our community or contact support@autodocs.com
