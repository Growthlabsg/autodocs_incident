# 📱 SDK Documentation

Official SDKs for AutoDocs+AutoIncident API

---

## 🟨 JavaScript/Node.js SDK

### Installation

```bash
npm install @autodocs/incident-sdk
# or
yarn add @autodocs/incident-sdk
```

### Quick Start

```javascript
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

// Initialize client
const client = new AutoIncidentClient({
  apiKey: 'your_api_key',
  // or use JWT
  // token: 'your_jwt_token'
});

// Create an incident
async function main() {
  const incident = await client.incidents.create({
    title: 'Production Database Down',
    severity: 'SEV1',
    service_id: 10
  });
  
  console.log('Incident created:', incident.incident_number);
}
```

### Authentication

```javascript
// Option 1: API Key
const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY
});

// Option 2: JWT Token
const client = new AutoIncidentClient({
  token: process.env.AUTODOCS_JWT_TOKEN
});

// Option 3: Login with credentials
const client = new AutoIncidentClient();
await client.auth.login({
  email: 'user@company.com',
  password: 'your_password'
});
```

### Incidents

```javascript
// List incidents
const incidents = await client.incidents.list({
  severity: 'SEV1',
  status: 'investigating',
  page: 1,
  per_page: 20
});

// Get incident
const incident = await client.incidents.get(123);

// Create incident
const newIncident = await client.incidents.create({
  title: 'API Rate Limiting Issues',
  description: 'Users experiencing 429 errors',
  severity: 'SEV2',
  service_id: 15,
  assignee_ids: [5, 8]
});

// Update incident
const updated = await client.incidents.update(123, {
  status: 'monitoring'
});

// Resolve incident
await client.incidents.resolve(123, {
  resolution_summary: 'Fixed by rolling back deployment',
  root_cause: 'Bug in v2.3.1'
});

// AI Classification
const classification = await client.incidents.classify(123);
console.log('Suggested severity:', classification.suggested_severity);

// Generate Post-Mortem
const postmortem = await client.incidents.generatePostMortem(123);
```

### Incident Roles

```javascript
// Assign role
await client.incidentRoles.assign(123, {
  user_id: 5,
  role: 'incident_commander'
});

// Get roles
const roles = await client.incidentRoles.list(123);

// Auto-assign roles
await client.incidentRoles.autoAssign(123);
```

### On-Call

```javascript
// Get current on-call
const oncall = await client.oncall.current();

// Get by team
const teamOncall = await client.oncall.current({ team_id: 2 });

// Request shift swap
const swap = await client.oncall.requestSwap({
  shift_id: 150,
  to_user_id: 8,
  reason: 'Family emergency'
});

// Calculate pay
const pay = await client.oncall.calculatePay({
  start_date: '2024-04-01',
  end_date: '2024-05-01',
  user_id: 5
});
```

### Status Pages

```javascript
// Create status page
const statusPage = await client.statusPages.create({
  name: 'Public Status',
  subdomain: 'status',
  type: 'public'
});

// Add component
const component = await client.statusPages.addComponent(1, {
  name: 'API Server',
  status: 'operational'
});

// Update component status
await client.statusPages.updateComponentStatus(5, {
  status: 'degraded',
  message: 'Experiencing high latency'
});
```

### Analytics

```javascript
// Executive dashboard
const dashboard = await client.analytics.executive({
  start_date: '2024-04-01',
  end_date: '2024-05-01'
});

console.log('MTTR:', dashboard.metrics.avg_mttr_minutes);
console.log('SLA:', dashboard.metrics.sla_compliance);

// MTTR trends
const mttr = await client.analytics.mttr();
```

### Webhooks

```javascript
const express = require('express');
const { WebhookValidator } = require('@autodocs/incident-sdk');

const app = express();
const validator = new WebhookValidator('your_webhook_secret');

app.post('/webhooks/incidents', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!validator.verify(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  if (event === 'incident.created') {
    console.log('New incident:', data.incident.incident_number);
  }
  
  res.status(200).send('OK');
});
```

### Error Handling

```javascript
const { AutoIncidentError } = require('@autodocs/incident-sdk');

try {
  await client.incidents.create({ title: '' }); // Invalid
} catch (error) {
  if (error instanceof AutoIncidentError) {
    console.error('API Error:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
```

### Real-Time Updates

```javascript
// Subscribe to incident updates
const subscription = client.incidents.subscribe(123);

subscription.on('update', (data) => {
  console.log('Incident updated:', data);
});

subscription.on('status_change', (data) => {
  console.log('Status changed to:', data.status);
});

// Unsubscribe
subscription.unsubscribe();
```

### TypeScript Support

```typescript
import { AutoIncidentClient, Incident, CreateIncidentRequest } from '@autodocs/incident-sdk';

const client = new AutoIncidentClient({ apiKey: 'key' });

const request: CreateIncidentRequest = {
  title: 'Database Issues',
  severity: 'SEV1'
};

const incident: Incident = await client.incidents.create(request);
```

---

## 🐍 Python SDK

### Installation

```bash
pip install autodocs-incident
```

### Quick Start

```python
from autodocs import AutoIncidentClient

# Initialize client
client = AutoIncidentClient(api_key='your_api_key')

# Create an incident
incident = client.incidents.create(
    title='Production Database Down',
    severity='SEV1',
    service_id=10
)

print(f'Incident created: {incident.incident_number}')
```

### Authentication

```python
# Option 1: API Key
from autodocs import AutoIncidentClient

client = AutoIncidentClient(api_key='your_api_key')

# Option 2: JWT Token
client = AutoIncidentClient(token='your_jwt_token')

# Option 3: Login
client = AutoIncidentClient()
client.auth.login(
    email='user@company.com',
    password='your_password'
)
```

### Incidents

```python
# List incidents
incidents = client.incidents.list(
    severity='SEV1',
    status='investigating',
    page=1,
    per_page=20
)

for incident in incidents:
    print(f"{incident.incident_number}: {incident.title}")

# Get incident
incident = client.incidents.get(123)

# Create incident
new_incident = client.incidents.create(
    title='API Rate Limiting Issues',
    description='Users experiencing 429 errors',
    severity='SEV2',
    service_id=15,
    assignee_ids=[5, 8]
)

# Update incident
updated = client.incidents.update(
    123,
    status='monitoring'
)

# Resolve incident
client.incidents.resolve(
    123,
    resolution_summary='Fixed by rolling back',
    root_cause='Bug in v2.3.1'
)

# AI Classification
classification = client.incidents.classify(123)
print(f"Suggested: {classification.suggested_severity}")

# Generate Post-Mortem
postmortem = client.incidents.generate_postmortem(123)
```

### Incident Roles

```python
# Assign role
client.incident_roles.assign(
    incident_id=123,
    user_id=5,
    role='incident_commander'
)

# Get roles
roles = client.incident_roles.list(123)

# Auto-assign
client.incident_roles.auto_assign(123)
```

### On-Call

```python
# Get current on-call
oncall = client.oncall.current()

# Get by team
team_oncall = client.oncall.current(team_id=2)

# Request shift swap
swap = client.oncall.request_swap(
    shift_id=150,
    to_user_id=8,
    reason='Family emergency'
)

# Calculate pay
pay = client.oncall.calculate_pay(
    start_date='2024-04-01',
    end_date='2024-05-01',
    user_id=5
)

print(f"Total pay: ${pay.total_pay}")
print(f"Total hours: {pay.total_hours}")
```

### Status Pages

```python
# Create status page
status_page = client.status_pages.create(
    name='Public Status',
    subdomain='status',
    type='public'
)

# Add component
component = client.status_pages.add_component(
    status_page_id=1,
    name='API Server',
    status='operational'
)

# Update component status
client.status_pages.update_component_status(
    component_id=5,
    status='degraded',
    message='High latency'
)
```

### Analytics

```python
# Executive dashboard
dashboard = client.analytics.executive(
    start_date='2024-04-01',
    end_date='2024-05-01'
)

print(f"MTTR: {dashboard.metrics.avg_mttr_minutes} min")
print(f"SLA: {dashboard.metrics.sla_compliance}%")

# MTTR trends
mttr = client.analytics.mttr()
```

### Webhooks

```python
from flask import Flask, request
from autodocs import WebhookValidator

app = Flask(__name__)
validator = WebhookValidator('your_webhook_secret')

@app.route('/webhooks/incidents', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    
    if not validator.verify(request.json, signature):
        return 'Invalid signature', 401
    
    data = request.json
    event = data['event']
    
    if event == 'incident.created':
        incident = data['data']['incident']
        print(f"New incident: {incident['incident_number']}")
    
    return 'OK', 200
```

### Error Handling

```python
from autodocs import AutoIncidentError, RateLimitError

try:
    client.incidents.create(title='')  # Invalid
except RateLimitError:
    print("Rate limit exceeded")
except AutoIncidentError as e:
    print(f"Error: {e.code}")
    print(f"Message: {e.message}")
    print(f"Details: {e.details}")
```

### Context Manager

```python
from autodocs import AutoIncidentClient

with AutoIncidentClient(api_key='key') as client:
    incident = client.incidents.create(
        title='Database Down',
        severity='SEV1'
    )
```

### Async Support

```python
import asyncio
from autodocs import AsyncAutoIncidentClient

async def main():
    client = AsyncAutoIncidentClient(api_key='key')
    
    # All methods support async
    incident = await client.incidents.create(
        title='Database Down',
        severity='SEV1'
    )
    
    incidents = await client.incidents.list(severity='SEV1')
    
    await client.close()

asyncio.run(main())
```

### Type Hints

```python
from autodocs import AutoIncidentClient, Incident, CreateIncidentRequest

client: AutoIncidentClient = AutoIncidentClient(api_key='key')

request: CreateIncidentRequest = CreateIncidentRequest(
    title='Database Issues',
    severity='SEV1'
)

incident: Incident = client.incidents.create(request)
```

---

## 🚀 Advanced Features

### Pagination

**JavaScript:**
```javascript
// Manual pagination
let page = 1;
const allIncidents = [];

while (true) {
  const response = await client.incidents.list({ page, per_page: 100 });
  allIncidents.push(...response.incidents);
  
  if (response.pagination.page >= response.pagination.total_pages) break;
  page++;
}

// Auto-pagination
const incidents = await client.incidents.listAll({ severity: 'SEV1' });
```

**Python:**
```python
# Manual pagination
page = 1
all_incidents = []

while True:
    response = client.incidents.list(page=page, per_page=100)
    all_incidents.extend(response.incidents)
    
    if page >= response.pagination.total_pages:
        break
    page += 1

# Auto-pagination
incidents = client.incidents.list_all(severity='SEV1')
```

### Batch Operations

**JavaScript:**
```javascript
// Create multiple incidents
const incidents = await Promise.all([
  client.incidents.create({ title: 'Issue 1', severity: 'SEV2' }),
  client.incidents.create({ title: 'Issue 2', severity: 'SEV3' }),
  client.incidents.create({ title: 'Issue 3', severity: 'SEV4' })
]);
```

**Python:**
```python
import concurrent.futures

# Create multiple incidents
with concurrent.futures.ThreadPoolExecutor() as executor:
    futures = [
        executor.submit(client.incidents.create, title=f'Issue {i}', severity='SEV2')
        for i in range(10)
    ]
    incidents = [f.result() for f in futures]
```

### Retry Logic

**JavaScript:**
```javascript
const client = new AutoIncidentClient({
  apiKey: 'key',
  retries: 3,
  retryDelay: 1000
});
```

**Python:**
```python
client = AutoIncidentClient(
    api_key='key',
    max_retries=3,
    retry_delay=1.0
)
```

---

## 📚 Resources

- **GitHub (JS):** https://github.com/autodocs/incident-sdk-js
- **GitHub (Python):** https://github.com/autodocs/incident-sdk-python
- **Examples:** https://github.com/autodocs/sdk-examples
- **Support:** sdk-support@autodocs.com

---

## 🐛 Reporting Issues

Found a bug? Report it on GitHub:
- JavaScript: https://github.com/autodocs/incident-sdk-js/issues
- Python: https://github.com/autodocs/incident-sdk-python/issues
