# 🧪 API Testing Guide

Complete testing guide for AutoDocs+AutoIncident API

---

## 📋 Table of Contents

1. [Test Setup](#test-setup)
2. [Authentication Tests](#authentication-tests)
3. [Incident Tests](#incident-tests)
4. [Role Tests](#role-tests)
5. [Status Page Tests](#status-page-tests)
6. [Integration Tests](#integration-tests)
7. [Performance Tests](#performance-tests)
8. [Security Tests](#security-tests)

---

## 🔧 Test Setup

### Environment Setup

```bash
# .env.test
API_URL=https://staging-api.autodocs.com
TEST_USER_EMAIL=test@company.com
TEST_USER_PASSWORD=test_password
TEST_API_KEY=test_api_key_12345
```

### JavaScript (Jest)

```javascript
// tests/setup.js
const { AutoIncidentClient } = require('@autodocs/incident-sdk');

global.testClient = new AutoIncidentClient({
  baseUrl: process.env.API_URL,
  apiKey: process.env.TEST_API_KEY
});

// Helper functions
global.createTestIncident = async (overrides = {}) => {
  return await testClient.incidents.create({
    title: 'Test Incident',
    severity: 'SEV3',
    service_id: 10,
    ...overrides
  });
};

global.cleanupIncident = async (id) => {
  try {
    await testClient.incidents.delete(id);
  } catch (error) {
    // Already deleted
  }
};

// Jest configuration
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000
};
```

### Python (pytest)

```python
# tests/conftest.py
import pytest
from autodocs import AutoIncidentClient
import os

@pytest.fixture
def client():
    return AutoIncidentClient(
        base_url=os.getenv('API_URL'),
        api_key=os.getenv('TEST_API_KEY')
    )

@pytest.fixture
def test_incident(client):
    """Create and cleanup test incident"""
    incident = client.incidents.create(
        title='Test Incident',
        severity='SEV3',
        service_id=10
    )
    
    yield incident
    
    # Cleanup
    try:
        client.incidents.delete(incident.id)
    except:
        pass

# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## 🔐 Authentication Tests

### Test 1: Login Success

**JavaScript:**
```javascript
describe('Authentication', () => {
  test('should login successfully with valid credentials', async () => {
    const client = new AutoIncidentClient();
    
    const response = await client.auth.login({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD
    });
    
    expect(response.token).toBeDefined();
    expect(response.user.email).toBe(process.env.TEST_USER_EMAIL);
  });
});
```

**Python:**
```python
def test_login_success():
    client = AutoIncidentClient()
    
    response = client.auth.login(
        email=os.getenv('TEST_USER_EMAIL'),
        password=os.getenv('TEST_USER_PASSWORD')
    )
    
    assert response.token is not None
    assert response.user.email == os.getenv('TEST_USER_EMAIL')
```

### Test 2: Login Failure

**JavaScript:**
```javascript
test('should fail with invalid credentials', async () => {
  const client = new AutoIncidentClient();
  
  await expect(
    client.auth.login({
      email: 'invalid@example.com',
      password: 'wrong_password'
    })
  ).rejects.toThrow('Invalid credentials');
});
```

**Python:**
```python
def test_login_failure():
    client = AutoIncidentClient()
    
    with pytest.raises(AutoIncidentError) as exc:
        client.auth.login(
            email='invalid@example.com',
            password='wrong_password'
        )
    
    assert exc.value.code == 'INVALID_CREDENTIALS'
```

### Test 3: Token Expiration

**JavaScript:**
```javascript
test('should refresh expired token', async () => {
  const client = new AutoIncidentClient({ token: 'expired_token' });
  
  // This should auto-refresh
  const incidents = await client.incidents.list();
  expect(incidents).toBeDefined();
});
```

---

## 🚨 Incident Tests

### Test 4: Create Incident

**JavaScript:**
```javascript
describe('Incidents', () => {
  test('should create incident with required fields', async () => {
    const incident = await testClient.incidents.create({
      title: 'Database Connection Timeout',
      severity: 'SEV1',
      service_id: 10
    });
    
    expect(incident.id).toBeDefined();
    expect(incident.incident_number).toMatch(/^INC-\d{4}-\d+$/);
    expect(incident.severity).toBe('SEV1');
    
    await cleanupIncident(incident.id);
  });
});
```

**Python:**
```python
def test_create_incident(client):
    incident = client.incidents.create(
        title='Database Connection Timeout',
        severity='SEV1',
        service_id=10
    )
    
    assert incident.id is not None
    assert incident.incident_number.startswith('INC-')
    assert incident.severity == 'SEV1'
    
    client.incidents.delete(incident.id)
```

### Test 5: Validation Error

**JavaScript:**
```javascript
test('should fail with missing required fields', async () => {
  await expect(
    testClient.incidents.create({ description: 'No title' })
  ).rejects.toThrow(/title.*required/i);
});
```

**Python:**
```python
def test_create_incident_validation(client):
    with pytest.raises(AutoIncidentError) as exc:
        client.incidents.create(description='No title')
    
    assert 'title' in str(exc.value).lower()
    assert 'required' in str(exc.value).lower()
```

### Test 6: List with Filters

**JavaScript:**
```javascript
test('should filter incidents by severity', async () => {
  // Create test incidents
  await createTestIncident({ severity: 'SEV1' });
  await createTestIncident({ severity: 'SEV2' });
  
  const response = await testClient.incidents.list({ severity: 'SEV1' });
  
  expect(response.incidents.length).toBeGreaterThan(0);
  response.incidents.forEach(inc => {
    expect(inc.severity).toBe('SEV1');
  });
});
```

### Test 7: Update Incident

**JavaScript:**
```javascript
test('should update incident status', async () => {
  const incident = await createTestIncident();
  
  const updated = await testClient.incidents.update(incident.id, {
    status: 'monitoring'
  });
  
  expect(updated.status).toBe('monitoring');
  
  await cleanupIncident(incident.id);
});
```

### Test 8: Resolve Incident

**JavaScript:**
```javascript
test('should resolve incident with summary', async () => {
  const incident = await createTestIncident({ severity: 'SEV2' });
  
  const resolved = await testClient.incidents.resolve(incident.id, {
    resolution_summary: 'Fixed by restarting service',
    root_cause: 'Memory leak'
  });
  
  expect(resolved.status).toBe('resolved');
  expect(resolved.resolved_at).toBeDefined();
  expect(resolved.mttr_minutes).toBeGreaterThan(0);
  
  await cleanupIncident(incident.id);
});
```

---

## 👨‍✈️ Role Tests

### Test 9: Assign Role

**JavaScript:**
```javascript
describe('Incident Roles', () => {
  test('should assign incident commander', async () => {
    const incident = await createTestIncident();
    
    const role = await testClient.incidentRoles.assign(incident.id, {
      user_id: 5,
      role: 'incident_commander'
    });
    
    expect(role.role).toBe('incident_commander');
    expect(role.user.id).toBe(5);
    
    await cleanupIncident(incident.id);
  });
});
```

### Test 10: Auto-Assign Roles

**JavaScript:**
```javascript
test('should auto-assign roles based on severity', async () => {
  const incident = await createTestIncident({ severity: 'SEV1' });
  
  await testClient.incidentRoles.autoAssign(incident.id);
  
  const roles = await testClient.incidentRoles.list(incident.id);
  
  expect(roles.roles.length).toBeGreaterThan(0);
  expect(roles.roles.some(r => r.role === 'incident_commander')).toBe(true);
  
  await cleanupIncident(incident.id);
});
```

---

## 📊 Status Page Tests

### Test 11: Create Status Page

**JavaScript:**
```javascript
describe('Status Pages', () => {
  test('should create public status page', async () => {
    const statusPage = await testClient.statusPages.create({
      name: 'Test Status Page',
      subdomain: 'test-status',
      type: 'public'
    });
    
    expect(statusPage.id).toBeDefined();
    expect(statusPage.url).toContain('test-status');
  });
});
```

### Test 12: Update Component Status

**JavaScript:**
```javascript
test('should update component to degraded', async () => {
  const component = await testClient.statusPages.addComponent(1, {
    name: 'Test API',
    status: 'operational'
  });
  
  await testClient.statusPages.updateComponentStatus(component.id, {
    status: 'degraded',
    message: 'High latency detected'
  });
  
  const updated = await testClient.statusPages.getComponent(component.id);
  expect(updated.status).toBe('degraded');
});
```

---

## 🔄 Integration Tests

### Test 13: End-to-End Incident Flow

**JavaScript:**
```javascript
describe('E2E Incident Flow', () => {
  test('complete incident lifecycle', async () => {
    // 1. Create incident
    const incident = await testClient.incidents.create({
      title: 'E2E Test Incident',
      severity: 'SEV2',
      service_id: 10
    });
    expect(incident.status).toBe('investigating');
    
    // 2. Assign commander
    await testClient.incidentRoles.assign(incident.id, {
      user_id: 5,
      role: 'incident_commander'
    });
    
    // 3. Post update
    await testClient.incidents.postUpdate(incident.id, {
      message: 'Root cause identified',
      status: 'identified'
    });
    
    // 4. Update status
    await testClient.incidents.update(incident.id, {
      status: 'monitoring'
    });
    
    // 5. Resolve
    const resolved = await testClient.incidents.resolve(incident.id, {
      resolution_summary: 'Issue fixed',
      root_cause: 'Configuration error'
    });
    
    expect(resolved.status).toBe('resolved');
    expect(resolved.mttr_minutes).toBeGreaterThan(0);
    
    await cleanupIncident(incident.id);
  });
});
```

### Test 14: Webhook Flow

**JavaScript:**
```javascript
test('webhook delivery and verification', async () => {
  const express = require('express');
  const { WebhookValidator } = require('@autodocs/incident-sdk');
  
  let receivedEvent = null;
  
  // Setup webhook server
  const app = express();
  const validator = new WebhookValidator(process.env.WEBHOOK_SECRET);
  
  app.post('/webhook', express.json(), (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    
    if (validator.verify(req.body, signature)) {
      receivedEvent = req.body;
      res.status(200).send('OK');
    } else {
      res.status(401).send('Invalid signature');
    }
  });
  
  const server = app.listen(3000);
  
  // Trigger event
  const incident = await createTestIncident();
  
  // Wait for webhook
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  expect(receivedEvent).toBeDefined();
  expect(receivedEvent.event).toBe('incident.created');
  expect(receivedEvent.data.incident.id).toBe(incident.id);
  
  server.close();
  await cleanupIncident(incident.id);
});
```

---

## ⚡ Performance Tests

### Test 15: Response Time

**JavaScript:**
```javascript
describe('Performance', () => {
  test('incident creation should complete within 500ms', async () => {
    const start = Date.now();
    
    const incident = await createTestIncident();
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
    
    await cleanupIncident(incident.id);
  });
});
```

### Test 16: Bulk Operations

**JavaScript:**
```javascript
test('should handle 100 concurrent requests', async () => {
  const promises = Array(100).fill().map((_, i) => 
    createTestIncident({ title: `Bulk Test ${i}` })
  );
  
  const start = Date.now();
  const incidents = await Promise.all(promises);
  const duration = Date.now() - start;
  
  expect(incidents.length).toBe(100);
  expect(duration).toBeLessThan(5000); // Under 5 seconds
  
  // Cleanup
  await Promise.all(incidents.map(inc => cleanupIncident(inc.id)));
});
```

### Test 17: Rate Limiting

**JavaScript:**
```javascript
test('should respect rate limits', async () => {
  const requests = [];
  
  // Exceed rate limit (assuming 1000/hour)
  for (let i = 0; i < 1010; i++) {
    requests.push(
      testClient.incidents.list().catch(err => err)
    );
  }
  
  const results = await Promise.all(requests);
  const rateLimitErrors = results.filter(
    r => r.code === 'RATE_LIMIT_EXCEEDED'
  );
  
  expect(rateLimitErrors.length).toBeGreaterThan(0);
});
```

---

## 🔒 Security Tests

### Test 18: Unauthorized Access

**JavaScript:**
```javascript
describe('Security', () => {
  test('should reject requests without auth token', async () => {
    const client = new AutoIncidentClient(); // No token
    
    await expect(
      client.incidents.list()
    ).rejects.toThrow(/unauthorized|401/i);
  });
});
```

### Test 19: Invalid Token

**JavaScript:**
```javascript
test('should reject invalid token', async () => {
  const client = new AutoIncidentClient({ token: 'invalid_token' });
  
  await expect(
    client.incidents.list()
  ).rejects.toThrow(/invalid.*token/i);
});
```

### Test 20: Permission Checks

**JavaScript:**
```javascript
test('viewer role cannot create incidents', async () => {
  const viewerClient = new AutoIncidentClient({
    token: process.env.VIEWER_TOKEN
  });
  
  await expect(
    viewerClient.incidents.create({
      title: 'Test',
      severity: 'SEV3'
    })
  ).rejects.toThrow(/permission|forbidden|403/i);
});
```

---

## 🎯 Test Scenarios

### Scenario 1: SEV1 Incident Response

```javascript
test('SEV1 incident full response flow', async () => {
  // Simulate critical incident
  const incident = await testClient.incidents.create({
    title: 'Production Database Down',
    severity: 'SEV1',
    service_id: 10
  });
  
  // Auto-assignment should trigger
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const roles = await testClient.incidentRoles.list(incident.id);
  expect(roles.roles.length).toBeGreaterThan(0);
  
  // Slack notification should be sent
  // Status page should be updated
  // On-call should be paged
  
  await cleanupIncident(incident.id);
});
```

### Scenario 2: Alert Routing

```javascript
test('alert routing creates incident', async () => {
  // Send alert webhook
  const alertResponse = await testClient.alerts.process({
    source: 'datadog',
    title: 'High CPU Usage',
    severity: 'critical',
    metadata: { host: 'prod-web-01' }
  });
  
  expect(alertResponse.actions_taken).toContainEqual(
    expect.objectContaining({ action: 'create_incident' })
  );
  
  expect(alertResponse.incident_id).toBeDefined();
  
  await cleanupIncident(alertResponse.incident_id);
});
```

---

## 📊 Test Reports

### Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All critical paths
- **E2E Tests:** Main user journeys
- **Performance Tests:** Key endpoints < 500ms

### Running Tests

```bash
# JavaScript
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode

# Python
pytest                      # All tests
pytest --cov               # With coverage
pytest -v                  # Verbose
pytest -k "test_incident"  # Specific tests
```

### CI/CD Integration

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test -- --coverage
        env:
          API_URL: ${{ secrets.STAGING_API_URL }}
          TEST_API_KEY: ${{ secrets.TEST_API_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 🐛 Debugging Failed Tests

### Enable Debug Logging

**JavaScript:**
```javascript
process.env.DEBUG = 'autodocs:*';
```

**Python:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Capture Network Traffic

```javascript
const client = new AutoIncidentClient({
  apiKey: 'key',
  debug: true,
  interceptors: {
    request: (config) => {
      console.log('Request:', config);
      return config;
    },
    response: (response) => {
      console.log('Response:', response);
      return response;
    }
  }
});
```

---

## 📚 Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Always cleanup test data
3. **Fixtures:** Use fixtures for common setup
4. **Assertions:** Be specific with assertions
5. **Async:** Properly handle async operations
6. **Mocking:** Mock external dependencies
7. **Coverage:** Aim for 80%+ code coverage
8. **Speed:** Keep tests fast (< 30s total)

---

**Need help?** Contact api-support@autodocs.com
