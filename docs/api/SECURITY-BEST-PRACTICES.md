# 🔒 API Security Best Practices

Complete security guide for AutoDocs+AutoIncident API integration

---

## 📋 Table of Contents

1. [Authentication Security](#authentication-security)
2. [API Key Management](#api-key-management)
3. [Network Security](#network-security)
4. [Data Protection](#data-protection)
5. [Rate Limiting](#rate-limiting)
6. [Webhook Security](#webhook-security)
7. [Error Handling](#error-handling)
8. [Compliance](#compliance)

---

## 🔐 Authentication Security

### Best Practice 1: Never Hardcode Credentials

**❌ BAD:**
```javascript
const client = new AutoIncidentClient({
  apiKey: 'ad_live_abc123456789' // NEVER DO THIS!
});
```

**✅ GOOD:**
```javascript
// Use environment variables
const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY
});
```

**Environment Setup:**
```bash
# .env
AUTODOCS_API_KEY=ad_live_abc123456789

# Never commit .env to git!
# Add to .gitignore:
echo ".env" >> .gitignore
```

### Best Practice 2: Use Short-Lived Tokens

**JWT Tokens** expire automatically. Refresh them regularly:

```javascript
class SecureClient {
  constructor() {
    this.client = new AutoIncidentClient();
    this.tokenExpiresAt = null;
  }
  
  async ensureValidToken() {
    const now = Date.now();
    
    // Refresh if token expires in < 5 minutes
    if (!this.tokenExpiresAt || this.tokenExpiresAt - now < 5 * 60 * 1000) {
      const response = await this.client.auth.refresh();
      this.client.setToken(response.token);
      this.tokenExpiresAt = now + (response.expires_in * 1000);
    }
  }
  
  async makeRequest(fn) {
    await this.ensureValidToken();
    return await fn();
  }
}

// Usage
const secureClient = new SecureClient();
await secureClient.makeRequest(() => 
  client.incidents.list()
);
```

### Best Practice 3: Implement SSO Where Possible

**For enterprise deployments:**

```javascript
// Use SSO instead of API keys for user-facing apps
async function loginWithSSO(orgId) {
  const client = new AutoIncidentClient();
  
  // Redirect to SSO
  const ssoUrl = await client.auth.getSSOUrl(orgId);
  window.location.href = ssoUrl;
  
  // Handle callback
  // Token will be in URL params
}
```

### Best Practice 4: Rotate Credentials Regularly

```bash
# Rotate API keys every 90 days
# Set up calendar reminder!

# When rotating:
# 1. Generate new key
# 2. Update environment variables
# 3. Deploy to all environments
# 4. Verify connectivity
# 5. Delete old key
```

---

## 🔑 API Key Management

### Best Practice 5: Use Different Keys Per Environment

```bash
# .env.development
AUTODOCS_API_KEY=ad_test_dev123...

# .env.staging
AUTODOCS_API_KEY=ad_test_staging456...

# .env.production
AUTODOCS_API_KEY=ad_live_prod789...
```

### Best Practice 6: Restrict Key Permissions

**In AutoDocs dashboard:**
1. Create separate keys for different purposes
2. Limit scope to only what's needed:
   - Read-only key for dashboards
   - Write key for CI/CD
   - Full access key for admins

```javascript
// Dashboard app - read only
const dashboardClient = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_READONLY_KEY
});

// CI/CD - write only
const ciClient = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_CI_KEY
});
```

### Best Practice 7: Monitor Key Usage

```javascript
// Log all API calls
const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY,
  interceptors: {
    request: (config) => {
      logger.info('API Request', {
        method: config.method,
        url: config.url,
        timestamp: new Date().toISOString()
      });
      return config;
    },
    response: (response) => {
      logger.info('API Response', {
        status: response.status,
        timestamp: new Date().toISOString()
      });
      return response;
    }
  }
});

// Set up alerts for suspicious activity:
// - Requests from unexpected IPs
// - Unusual request volumes
// - Failed authentication attempts
```

### Best Practice 8: Secure Key Storage

**In Production:**

```javascript
// Use secrets manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getApiKey() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'autodocs/api-key'
  }).promise();
  
  return JSON.parse(secret.SecretString).api_key;
}

// Initialize client
const apiKey = await getApiKey();
const client = new AutoIncidentClient({ apiKey });
```

**Options:**
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

---

## 🌐 Network Security

### Best Practice 9: Use HTTPS Only

```javascript
// Always use HTTPS
const client = new AutoIncidentClient({
  baseUrl: 'https://api.autodocs.com', // HTTPS!
  apiKey: process.env.AUTODOCS_API_KEY
});

// Reject self-signed certificates in production
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
}
```

### Best Practice 10: Implement IP Whitelisting

**In AutoDocs dashboard:**
1. Go to **Settings → API Security**
2. Add your server IPs to whitelist
3. Enable IP restriction

**Dynamic IPs? Use VPN or proxy:**

```javascript
// Route through static IP proxy
const client = new AutoIncidentClient({
  apiKey: process.env.AUTODOCS_API_KEY,
  proxy: {
    host: 'proxy.yourcompany.com',
    port: 8080,
    auth: {
      username: process.env.PROXY_USER,
      password: process.env.PROXY_PASS
    }
  }
});
```

### Best Practice 11: Implement Request Signing

```javascript
const crypto = require('crypto');

function signRequest(method, path, body, timestamp, secret) {
  const payload = `${method}:${path}:${JSON.stringify(body)}:${timestamp}`;
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Add signature to requests
const timestamp = Date.now();
const signature = signRequest('POST', '/api/incidents', requestBody, timestamp, apiSecret);

const response = await fetch('https://api.autodocs.com/api/incidents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'X-Timestamp': timestamp,
    'X-Signature': signature
  },
  body: JSON.stringify(requestBody)
});
```

---

## 🛡️ Data Protection

### Best Practice 12: Encrypt Sensitive Data

```javascript
const crypto = require('crypto');

class SecureDataHandler {
  constructor(encryptionKey) {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(encryptionKey, 'hex');
  }
  
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encrypted, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}

// Usage
const handler = new SecureDataHandler(process.env.ENCRYPTION_KEY);

// Store incident with sensitive data
const sensitiveData = {
  customer_emails: ['user@company.com'],
  internal_notes: 'Sensitive information'
};

const encrypted = handler.encrypt(sensitiveData);

await client.incidents.create({
  title: 'Incident',
  severity: 'SEV2',
  custom_fields: {
    encrypted_data: JSON.stringify(encrypted)
  }
});
```

### Best Practice 13: Sanitize Input

```javascript
function sanitizeInput(input) {
  // Remove HTML tags
  const sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove SQL injection attempts
  const dangerous = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT'];
  let safe = sanitized;
  dangerous.forEach(word => {
    safe = safe.replace(new RegExp(word, 'gi'), '');
  });
  
  // Trim and limit length
  return safe.trim().substring(0, 10000);
}

// Before creating incident
const incident = await client.incidents.create({
  title: sanitizeInput(userInput.title),
  description: sanitizeInput(userInput.description)
});
```

### Best Practice 14: Implement Data Retention

```javascript
// Auto-delete old test incidents
async function cleanupTestData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
  
  const incidents = await client.incidents.list({
    created_before: cutoffDate.toISOString(),
    tags: ['test', 'development']
  });
  
  for (const incident of incidents.incidents) {
    await client.incidents.delete(incident.id);
    console.log(`Deleted old test incident: ${incident.incident_number}`);
  }
}

// Run weekly
setInterval(cleanupTestData, 7 * 24 * 60 * 60 * 1000);
```

---

## ⚡ Rate Limiting

### Best Practice 15: Implement Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
await retryWithBackoff(() => 
  client.incidents.create({ title: 'Incident', severity: 'SEV2' })
);
```

### Best Practice 16: Implement Request Queuing

```javascript
class RateLimitedClient {
  constructor(client, requestsPerSecond = 10) {
    this.client = client;
    this.queue = [];
    this.processing = false;
    this.delay = 1000 / requestsPerSecond;
  }
  
  async request(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Wait before next request
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, this.delay));
      }
    }
    
    this.processing = false;
  }
}

// Usage
const rateLimitedClient = new RateLimitedClient(client, 10); // 10 req/sec

// These will be queued and executed at safe rate
await Promise.all([
  rateLimitedClient.request(() => client.incidents.create({...})),
  rateLimitedClient.request(() => client.incidents.create({...})),
  rateLimitedClient.request(() => client.incidents.create({...}))
]);
```

---

## 🪝 Webhook Security

### Best Practice 17: Verify Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express webhook handler
app.post('/webhooks/incidents', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  handleWebhook(payload);
  res.status(200).send('OK');
});
```

### Best Practice 18: Implement Replay Protection

```javascript
const processedWebhooks = new Set();

function isReplayAttack(webhookId, timestamp) {
  // Check if already processed
  if (processedWebhooks.has(webhookId)) {
    return true;
  }
  
  // Check if timestamp is recent (within 5 minutes)
  const age = Date.now() - new Date(timestamp).getTime();
  if (age > 5 * 60 * 1000) {
    return true;
  }
  
  // Mark as processed
  processedWebhooks.add(webhookId);
  
  // Clean up old entries (keep last 10000)
  if (processedWebhooks.size > 10000) {
    const firstEntry = processedWebhooks.values().next().value;
    processedWebhooks.delete(firstEntry);
  }
  
  return false;
}

app.post('/webhooks/incidents', (req, res) => {
  const { id, timestamp } = req.body;
  
  if (isReplayAttack(id, timestamp)) {
    return res.status(400).json({ error: 'Replay detected' });
  }
  
  // Process webhook
  res.status(200).send('OK');
});
```

---

## ❌ Error Handling

### Best Practice 19: Never Expose Sensitive Errors

```javascript
// ❌ BAD - Exposes internal details
app.post('/api/create-incident', async (req, res) => {
  try {
    await client.incidents.create(req.body);
  } catch (error) {
    // NEVER DO THIS!
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// ✅ GOOD - Safe error handling
app.post('/api/create-incident', async (req, res) => {
  try {
    const incident = await client.incidents.create(req.body);
    res.json({ success: true, incident });
  } catch (error) {
    // Log internally
    logger.error('Incident creation failed', {
      error: error.message,
      stack: error.stack,
      request: req.body
    });
    
    // Return safe error to client
    res.status(500).json({
      error: 'Failed to create incident',
      code: 'INCIDENT_CREATION_FAILED'
    });
  }
});
```

### Best Practice 20: Implement Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.log('Circuit breaker opened');
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

try {
  await breaker.execute(() => 
    client.incidents.create({ title: 'Incident', severity: 'SEV2' })
  );
} catch (error) {
  console.error('Request failed or circuit breaker open');
}
```

---

## ✅ Compliance

### Best Practice 21: GDPR Compliance

```javascript
// Implement data subject requests
async function handleGDPRRequest(userId, requestType) {
  switch (requestType) {
    case 'ACCESS':
      // Export all user data
      return await exportUserData(userId);
      
    case 'DELETE':
      // Delete user data
      await deleteUserData(userId);
      break;
      
    case 'RECTIFICATION':
      // Update incorrect data
      await updateUserData(userId, correctedData);
      break;
  }
}

async function exportUserData(userId) {
  const incidents = await client.incidents.list({ assignee_id: userId });
  const shifts = await client.oncall.getUserShifts(userId);
  
  return {
    incidents: incidents.incidents,
    shifts: shifts.shifts,
    // ... other data
  };
}
```

### Best Practice 22: Audit Logging

```javascript
const auditLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

// Log all API operations
function auditLog(action, details) {
  auditLogger.info({
    timestamp: new Date().toISOString(),
    action,
    user: currentUser.id,
    ip: clientIp,
    ...details
  });
}

// Usage
async function createIncident(data) {
  const incident = await client.incidents.create(data);
  
  auditLog('INCIDENT_CREATED', {
    incident_id: incident.id,
    severity: incident.severity
  });
  
  return incident;
}
```

---

## 🎯 Security Checklist

### Development
- [ ] No hardcoded credentials
- [ ] Environment variables configured
- [ ] .env in .gitignore
- [ ] Input sanitization implemented
- [ ] Error handling doesn't expose secrets

### Staging
- [ ] Separate API keys from production
- [ ] SSL/TLS enabled
- [ ] Rate limiting tested
- [ ] Webhook signatures verified

### Production
- [ ] API keys in secrets manager
- [ ] IP whitelisting enabled
- [ ] Monitoring and alerts configured
- [ ] Audit logging enabled
- [ ] Circuit breakers implemented
- [ ] Regular security audits scheduled

---

## 🚨 Incident Response

### If API Key is Compromised:

1. **Immediately:**
   - Revoke compromised key in dashboard
   - Generate new key
   - Update all environments

2. **Investigate:**
   - Check audit logs for unauthorized access
   - Identify what data was accessed
   - Document timeline

3. **Notify:**
   - Inform security team
   - Notify affected users if needed
   - Report to compliance team

4. **Prevent:**
   - Review security practices
   - Implement additional controls
   - Update documentation

---

## 📚 Additional Resources

- **OWASP API Security:** https://owasp.org/www-project-api-security/
- **Security Documentation:** https://docs.autodocs.com/security
- **Report Security Issues:** security@autodocs.com
- **Security Advisories:** https://autodocs.com/security/advisories

---

**Remember:** Security is everyone's responsibility. When in doubt, ask the security team!
