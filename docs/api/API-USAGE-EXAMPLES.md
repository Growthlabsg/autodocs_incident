# 📊 API Usage Examples

Common workflows and real-world examples

---

## 📋 Table of Contents

1. [Incident Management](#incident-management)
2. [On-Call Operations](#on-call-operations)
3. [Status Page Updates](#status-page-updates)
4. [Analytics & Reporting](#analytics--reporting)
5. [Alert Routing](#alert-routing)
6. [Automation Workflows](#automation-workflows)

---

## 🚨 Incident Management

### Example 1: Create SEV1 Incident with Full Details

```javascript
const { AutoIncidentClient } = require('@autodocs/incident-sdk');
const client = new AutoIncidentClient({ apiKey: process.env.API_KEY });

async function createCriticalIncident() {
  const incident = await client.incidents.create({
    title: 'Production Database Unreachable',
    description: `
      **Impact:** All API requests failing with 500 errors
      **Affected:** Production environment
      **Customer Impact:** All users unable to access platform
      **Started At:** 10:45 AM EST
    `,
    severity: 'SEV1',
    service_id: 10, // Production Database
    team_id: 2, // Database Team
    assignee_ids: [5, 8, 12], // Primary responders
    tags: ['database', 'outage', 'production'],
    custom_fields: {
      affected_region: 'US-East',
      customer_impact: 5000,
      revenue_impact: 150000
    }
  });
  
  // Auto-assign roles
  await client.incidentRoles.autoAssign(incident.id);
  
  // Post initial update
  await client.incidents.postUpdate(incident.id, {
    message: 'Database team paged. Investigation started.',
    notify_channels: ['slack', 'email']
  });
  
  console.log(`Created: ${incident.incident_number}`);
  return incident;
}
```

### Example 2: Incident Response Flow

```javascript
async function handleIncidentResponse(incidentId) {
  // 1. Initial assessment
  await client.incidents.update(incidentId, {
    status: 'investigating'
  });
  
  await client.incidents.postUpdate(incidentId, {
    message: 'Initial assessment: Database connection pool exhausted',
    status: 'investigating'
  });
  
  // 2. Root cause identified
  await client.incidents.postUpdate(incidentId, {
    message: 'Root cause: Memory leak in auth service v2.3.1',
    status: 'identified'
  });
  
  // 3. Fix deployed
  await client.incidents.update(incidentId, {
    status: 'monitoring'
  });
  
  await client.incidents.postUpdate(incidentId, {
    message: 'Fix deployed. Rolled back to v2.3.0. Monitoring for 30 minutes.',
    status: 'monitoring'
  });
  
  // 4. Wait and resolve
  setTimeout(async () => {
    await client.incidents.resolve(incidentId, {
      resolution_summary: 'Rolled back auth service to stable version. Connection pool recovered.',
      root_cause: 'Memory leak introduced in auth service v2.3.1',
      generate_postmortem: true
    });
  }, 30 * 60 * 1000); // 30 minutes
}
```

### Example 3: Batch Incident Creation

```javascript
async function createMultipleIncidents(incidents) {
  const results = await Promise.all(
    incidents.map(inc => 
      client.incidents.create(inc).catch(error => ({
        error: error.message,
        incident: inc
      }))
    )
  );
  
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  
  console.log(`✅ Created: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  return { successful, failed };
}

// Usage
const incidents = [
  { title: 'API Latency Spike', severity: 'SEV3', service_id: 11 },
  { title: 'Database Slow Queries', severity: 'SEV2', service_id: 10 },
  { title: 'Cache Hit Rate Drop', severity: 'SEV4', service_id: 15 }
];

await createMultipleIncidents(incidents);
```

### Example 4: Search and Filter Incidents

```javascript
async function findRecentDatabaseIncidents() {
  const response = await client.incidents.list({
    service_id: 10, // Database service
    severity: ['SEV1', 'SEV2'], // Critical and high
    status: 'resolved',
    created_after: '2024-04-01',
    sort: 'created_at',
    order: 'desc',
    per_page: 50
  });
  
  // Calculate average MTTR
  const incidents = response.incidents;
  const avgMTTR = incidents.reduce((sum, inc) => 
    sum + inc.mttr_minutes, 0
  ) / incidents.length;
  
  console.log(`Found ${incidents.length} incidents`);
  console.log(`Average MTTR: ${Math.round(avgMTTR)} minutes`);
  
  // Group by day
  const byDay = incidents.reduce((acc, inc) => {
    const day = inc.created_at.split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Incidents by day:', byDay);
}
```

---

## 📞 On-Call Operations

### Example 5: Current On-Call Lookup

```javascript
async function getOnCallContacts() {
  const oncall = await client.oncall.current();
  
  // Format for display
  const contacts = oncall.oncall.map(item => ({
    team: item.team.name,
    name: `${item.user.first_name} ${item.user.last_name}`,
    email: item.user.email,
    phone: item.user.phone,
    shift_end: item.shift.end_time
  }));
  
  console.table(contacts);
  return contacts;
}
```

### Example 6: Request Shift Swap

```javascript
async function requestShiftSwap(shiftId, toUserId, reason) {
  const swap = await client.oncall.requestSwap({
    shift_id: shiftId,
    to_user_id: toUserId,
    reason
  });
  
  console.log(`✅ Swap requested from ${swap.from_user.first_name} to ${swap.to_user.first_name}`);
  console.log(`Status: ${swap.status}`);
  console.log(`Request ID: ${swap.swap_id}`);
  
  return swap;
}

// Usage
await requestShiftSwap(150, 8, 'Medical appointment');
```

### Example 7: Calculate Team On-Call Pay

```javascript
async function calculateTeamPay(teamId, startDate, endDate) {
  // Get team members
  const team = await client.teams.get(teamId);
  
  // Calculate pay for each member
  const payResults = await Promise.all(
    team.members.map(async member => {
      const pay = await client.oncall.calculatePay({
        user_id: member.id,
        start_date: startDate,
        end_date: endDate
      });
      
      return {
        name: `${member.first_name} ${member.last_name}`,
        total_hours: pay.total_hours,
        total_pay: pay.total_pay,
        shifts: pay.breakdown.length
      };
    })
  );
  
  // Team totals
  const totals = payResults.reduce((acc, p) => ({
    hours: acc.hours + p.total_hours,
    pay: acc.pay + p.total_pay,
    shifts: acc.shifts + p.shifts
  }), { hours: 0, pay: 0, shifts: 0 });
  
  console.log(`\n${team.name} - On-Call Summary`);
  console.log(`Period: ${startDate} to ${endDate}`);
  console.table(payResults);
  console.log(`\nTotal Hours: ${totals.hours}`);
  console.log(`Total Pay: $${totals.pay.toLocaleString()}`);
  console.log(`Total Shifts: ${totals.shifts}`);
}

// Usage
await calculateTeamPay(2, '2024-04-01', '2024-05-01');
```

---

## 🌐 Status Page Updates

### Example 8: Update Multiple Components

```javascript
async function updateServiceStatus(statusPageId, updates) {
  const results = await Promise.all(
    updates.map(async update => {
      try {
        await client.statusPages.updateComponentStatus(
          update.component_id,
          {
            status: update.status,
            message: update.message
          }
        );
        return { success: true, component_id: update.component_id };
      } catch (error) {
        return { success: false, component_id: update.component_id, error };
      }
    })
  );
  
  console.log(`Updated ${results.filter(r => r.success).length} components`);
  return results;
}

// Usage: Major outage affecting multiple services
await updateServiceStatus(1, [
  {
    component_id: 5,
    status: 'major_outage',
    message: 'API completely unavailable'
  },
  {
    component_id: 6,
    status: 'major_outage',
    message: 'Database unreachable'
  },
  {
    component_id: 7,
    status: 'partial_outage',
    message: 'Web app experiencing intermittent issues'
  }
]);
```

### Example 9: Schedule Maintenance Window

```javascript
async function scheduleMaintenanceWindow(details) {
  const { component_id, start_time, end_time, description } = details;
  
  // Update component to maintenance status
  await client.statusPages.updateComponentStatus(component_id, {
    status: 'maintenance',
    message: `Scheduled maintenance: ${description}`
  });
  
  // Schedule status restoration
  const duration = new Date(end_time) - new Date(start_time);
  
  setTimeout(async () => {
    await client.statusPages.updateComponentStatus(component_id, {
      status: 'operational',
      message: 'Maintenance completed successfully'
    });
    console.log('✅ Maintenance window completed');
  }, duration);
  
  console.log(`📅 Maintenance scheduled from ${start_time} to ${end_time}`);
}

// Usage
await scheduleMaintenanceWindow({
  component_id: 5,
  start_time: '2024-05-15T02:00:00Z',
  end_time: '2024-05-15T04:00:00Z',
  description: 'Database upgrade to PostgreSQL 16'
});
```

---

## 📊 Analytics & Reporting

### Example 10: Generate Monthly Report

```javascript
async function generateMonthlyReport(year, month) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  // Get executive dashboard
  const dashboard = await client.analytics.executive({
    start_date: startDate,
    end_date: endDate
  });
  
  // Get MTTR trends
  const mttr = await client.analytics.mttr({
    start_date: startDate,
    end_date: endDate
  });
  
  const report = {
    period: `${year}-${month}`,
    summary: {
      total_incidents: dashboard.metrics.total_incidents,
      sev1_incidents: dashboard.metrics.incidents_by_severity.SEV1,
      avg_mttr: Math.round(dashboard.metrics.avg_mttr_minutes),
      sla_compliance: dashboard.metrics.sla_compliance
    },
    trends: {
      incidents_change: dashboard.trends.incidents_change_pct,
      mttr_change: dashboard.trends.mttr_change_pct
    },
    top_services: dashboard.top_affected_services,
    team_performance: dashboard.team_performance
  };
  
  // Format as markdown
  console.log(`# Incident Management Report - ${report.period}\n`);
  console.log(`## Summary`);
  console.log(`- Total Incidents: ${report.summary.total_incidents}`);
  console.log(`- SEV1 Incidents: ${report.summary.sev1_incidents}`);
  console.log(`- Average MTTR: ${report.summary.avg_mttr} minutes`);
  console.log(`- SLA Compliance: ${report.summary.sla_compliance}%\n`);
  
  console.log(`## Trends`);
  console.log(`- Incidents: ${report.trends.incidents_change > 0 ? '📈' : '📉'} ${Math.abs(report.trends.incidents_change)}%`);
  console.log(`- MTTR: ${report.trends.mttr_change > 0 ? '📈' : '📉'} ${Math.abs(report.trends.mttr_change)}%\n`);
  
  return report;
}

// Usage
const report = await generateMonthlyReport(2024, 4); // April 2024
```

### Example 11: Real-Time Metrics Dashboard

```javascript
async function displayRealTimeMetrics() {
  // Get current data
  const [activeIncidents, oncall, recentMTTR] = await Promise.all([
    client.incidents.list({ status: ['investigating', 'identified', 'monitoring'] }),
    client.oncall.current(),
    client.analytics.mttr()
  ]);
  
  const metrics = {
    active: {
      total: activeIncidents.incidents.length,
      sev1: activeIncidents.incidents.filter(i => i.severity === 'SEV1').length,
      sev2: activeIncidents.incidents.filter(i => i.severity === 'SEV2').length,
      unassigned: activeIncidents.incidents.filter(i => i.assignees.length === 0).length
    },
    oncall: {
      total: oncall.oncall.length,
      teams: oncall.oncall.map(o => o.team.name)
    },
    mttr: {
      avg_7d: Math.round(recentMTTR.mttr_by_day.slice(-7).reduce((sum, d) => 
        sum + d.avg_mttr_minutes, 0
      ) / 7)
    }
  };
  
  console.clear();
  console.log('╔══════════════════════════════════════╗');
  console.log('║     INCIDENT MANAGEMENT METRICS      ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║ Active Incidents: ${metrics.active.total.toString().padStart(19)}║`);
  console.log(`║   SEV1: ${metrics.active.sev1.toString().padStart(28)}║`);
  console.log(`║   SEV2: ${metrics.active.sev2.toString().padStart(28)}║`);
  console.log(`║   Unassigned: ${metrics.active.unassigned.toString().padStart(22)}║`);
  console.log('╠══════════════════════════════════════╣');
  console.log(`║ On-Call Teams: ${metrics.oncall.total.toString().padStart(21)}║`);
  console.log('╠══════════════════════════════════════╣');
  console.log(`║ Avg MTTR (7d): ${metrics.mttr.avg_7d.toString().padStart(15)} min ║`);
  console.log('╚══════════════════════════════════════╝');
}

// Refresh every 30 seconds
setInterval(displayRealTimeMetrics, 30000);
displayRealTimeMetrics();
```

---

## 🔔 Alert Routing

### Example 12: Create Smart Routing Rules

```javascript
async function setupAlertRouting() {
  // Rule 1: Critical production alerts
  await client.alertRouting.createRule({
    name: 'Critical Production Alerts',
    priority: 10,
    conditions: {
      operator: 'AND',
      rules: [
        { field: 'severity', operator: 'equals', value: 'critical' },
        { field: 'environment', operator: 'equals', value: 'production' }
      ]
    },
    actions: [
      { type: 'create_incident', config: { severity: 'SEV1' } },
      { type: 'page_team', config: { team_id: 2 } },
      { type: 'notify_slack', config: { channel: '#incidents' } }
    ]
  });
  
  // Rule 2: After-hours low priority
  await client.alertRouting.createRule({
    name: 'After Hours Low Priority',
    priority: 20,
    conditions: {
      operator: 'AND',
      rules: [
        { field: 'severity', operator: 'in', value: ['low', 'warning'] },
        { field: 'hour', operator: 'not_in', value: [9,10,11,12,13,14,15,16,17] }
      ]
    },
    actions: [
      { type: 'suppress', config: { until: '09:00' } }
    ]
  });
  
  // Rule 3: Database alerts to database team
  await client.alertRouting.createRule({
    name: 'Database Team Routing',
    priority: 15,
    conditions: {
      operator: 'OR',
      rules: [
        { field: 'service', operator: 'contains', value: 'database' },
        { field: 'tags', operator: 'contains', value: 'db' }
      ]
    },
    actions: [
      { type: 'assign_team', config: { team_id: 2 } }
    ]
  });
  
  console.log('✅ Alert routing rules configured');
}
```

---

## 🔄 Automation Workflows

### Example 13: Auto-Escalation System

```javascript
class AutoEscalationSystem {
  constructor(client) {
    this.client = client;
    this.checkInterval = 60000; // 1 minute
  }
  
  start() {
    console.log('🔄 Starting auto-escalation system');
    this.intervalId = setInterval(() => this.check(), this.checkInterval);
    this.check(); // Run immediately
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('⏹ Auto-escalation system stopped');
    }
  }
  
  async check() {
    try {
      const incidents = await this.client.incidents.list({
        status: 'investigating',
        severity: ['SEV1', 'SEV2']
      });
      
      for (const incident of incidents.incidents) {
        await this.checkIncident(incident);
      }
    } catch (error) {
      console.error('Error in auto-escalation:', error);
    }
  }
  
  async checkIncident(incident) {
    const createdAt = new Date(incident.created_at);
    const age = Date.now() - createdAt.getTime();
    
    // SEV1: Escalate if no commander after 5 minutes
    if (incident.severity === 'SEV1' && age > 5 * 60 * 1000) {
      const roles = await this.client.incidentRoles.list(incident.id);
      const hasCommander = roles.roles.some(r => r.role === 'incident_commander');
      
      if (!hasCommander) {
        console.log(`⚠️ Auto-escalating ${incident.incident_number} - No commander assigned`);
        await this.client.incidents.escalate(incident.id, {
          escalation_level: 2,
          reason: 'No incident commander assigned after 5 minutes',
          notify_teams: [1] // Leadership team
        });
      }
    }
    
    // SEV2: Escalate if no progress after 30 minutes
    if (incident.severity === 'SEV2' && age > 30 * 60 * 1000) {
      if (incident.updates.length === 0) {
        console.log(`⚠️ Auto-escalating ${incident.incident_number} - No updates`);
        await this.client.incidents.escalate(incident.id, {
          escalation_level: 1,
          reason: 'No updates after 30 minutes'
        });
      }
    }
  }
}

// Usage
const escalationSystem = new AutoEscalationSystem(client);
escalationSystem.start();
```

### Example 14: Incident Lifecycle Automation

```javascript
async function automateIncidentLifecycle(incidentId) {
  console.log(`🤖 Starting automated lifecycle for incident ${incidentId}`);
  
  // 1. Auto-assign roles
  await client.incidentRoles.autoAssign(incidentId);
  console.log('✅ Roles assigned');
  
  // 2. Create Slack channel
  const slackChannel = await client.slack.createIncidentChannel(incidentId);
  console.log(`✅ Slack channel created: ${slackChannel.channel_name}`);
  
  // 3. Update status page
  const incident = await client.incidents.get(incidentId);
  if (incident.severity === 'SEV1' || incident.severity === 'SEV2') {
    await client.statusPages.createIncident(1, {
      incident_id: incidentId,
      title: incident.title,
      status: 'investigating'
    });
    console.log('✅ Status page updated');
  }
  
  // 4. Generate AI suggestions
  const classification = await client.incidents.classify(incidentId);
  await client.incidents.postUpdate(incidentId, {
    message: `AI Analysis:\n- Suggested severity: ${classification.suggested_severity}\n- Category: ${classification.category}\n- Estimated MTTR: ${classification.estimated_mttr_minutes} min`,
    is_internal: true
  });
  console.log('✅ AI analysis posted');
  
  // 5. Find similar incidents
  const similar = await client.incidents.findSimilar(incidentId);
  if (similar.length > 0) {
    await client.incidents.postUpdate(incidentId, {
      message: `📚 Similar incidents found:\n${similar.slice(0, 3).map(s => 
        `- ${s.incident_number}: ${s.title} (${s.resolution_summary})`
      ).join('\n')}`,
      is_internal: true
    });
    console.log('✅ Similar incidents linked');
  }
  
  console.log('🎉 Automated lifecycle complete');
}
```

---

## 📚 More Examples

Visit our GitHub repository for more examples:
https://github.com/autodocs/api-examples

Categories:
- ✅ Incident Management
- ✅ On-Call Scheduling
- ✅ Status Pages
- ✅ Analytics & Reporting
- ✅ Alert Processing
- ✅ Webhook Handlers
- ✅ Custom Integrations
- ✅ Automation Scripts

**Need Help?** Contact api-support@autodocs.com
