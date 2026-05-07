// src/analytics/advancedAnalytics.js
// Advanced Analytics Engine for Tier 3

const db = require('../config/database');

class AdvancedAnalytics {
    // Executive Dashboard Metrics
    async getExecutiveDashboard(dateRange = '30d') {
        const days = parseInt(dateRange.replace('d', ''));
        
        const query = `
            SELECT 
                COUNT(*) as total_incidents,
                COUNT(*) FILTER (WHERE severity = 'SEV1') as sev1_count,
                COUNT(*) FILTER (WHERE severity = 'SEV2') as sev2_count,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_mttr_hours,
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_mttd_hours
            FROM incidents
            WHERE created_at >= NOW() - INTERVAL '${days} days'
        `;
        
        const result = await db.query(query);
        return result.rows[0];
    }

    // SLA Compliance Tracking
    async getSLACompliance(teamId = null) {
        const query = `
            SELECT 
                severity,
                COUNT(*) as total,
                COUNT(*) FILTER (
                    WHERE 
                        (severity = 'SEV1' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 3600) OR
                        (severity = 'SEV2' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 7200) OR
                        (severity = 'SEV3' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 14400) OR
                        (severity = 'SEV4' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 28800)
                ) as within_sla,
                ROUND(
                    100.0 * COUNT(*) FILTER (
                        WHERE 
                            (severity = 'SEV1' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 3600) OR
                            (severity = 'SEV2' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 7200) OR
                            (severity = 'SEV3' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 14400) OR
                            (severity = 'SEV4' AND EXTRACT(EPOCH FROM (resolved_at - created_at)) <= 28800)
                    ) / NULLIF(COUNT(*), 0), 2
                ) as sla_percentage
            FROM incidents
            WHERE status = 'resolved'
            ${teamId ? `AND id IN (SELECT incident_id FROM incident_assignees WHERE user_id IN (SELECT user_id FROM team_members WHERE team_id = $1))` : ''}
            GROUP BY severity
        `;
        
        const result = teamId ? await db.query(query, [teamId]) : await db.query(query);
        return result.rows;
    }

    // Team Performance Metrics
    async getTeamPerformance(teamId, dateRange = '30d') {
        const days = parseInt(dateRange.replace('d', ''));
        
        const query = `
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                COUNT(DISTINCT ia.incident_id) as incidents_handled,
                COUNT(DISTINCT ia.incident_id) FILTER (WHERE i.status = 'resolved') as incidents_resolved,
                AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600) as avg_resolution_time,
                COUNT(*) FILTER (WHERE i.severity = 'SEV1') as sev1_handled
            FROM users u
            JOIN team_members tm ON u.id = tm.user_id
            LEFT JOIN incident_assignees ia ON u.id = ia.user_id
            LEFT JOIN incidents i ON ia.incident_id = i.id
            WHERE tm.team_id = $1
                AND i.created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY u.id, u.first_name, u.last_name, u.email
            ORDER BY incidents_handled DESC
        `;
        
        const result = await db.query(query, [teamId]);
        return result.rows;
    }

    // Incident Patterns & Trends
    async getIncidentPatterns(dateRange = '90d') {
        const days = parseInt(dateRange.replace('d', ''));
        
        const query = `
            WITH daily_incidents AS (
                SELECT 
                    DATE(created_at) as date,
                    severity,
                    COUNT(*) as count
                FROM incidents
                WHERE created_at >= NOW() - INTERVAL '${days} days'
                GROUP BY DATE(created_at), severity
            )
            SELECT 
                date,
                severity,
                count,
                AVG(count) OVER (PARTITION BY severity ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg
            FROM daily_incidents
            ORDER BY date DESC, severity
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    // Service Reliability Score
    async getServiceReliability() {
        const query = `
            SELECT 
                s.id,
                s.name,
                s.status,
                COUNT(i.id) as total_incidents,
                COUNT(i.id) FILTER (WHERE i.severity IN ('SEV1', 'SEV2')) as critical_incidents,
                AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600) as avg_mttr,
                ROUND(
                    100.0 - (
                        100.0 * COUNT(i.id) FILTER (WHERE i.severity IN ('SEV1', 'SEV2')) 
                        / NULLIF(COUNT(i.id), 0)
                    ), 2
                ) as reliability_score
            FROM services s
            LEFT JOIN incidents i ON s.id = i.service_id
                AND i.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY s.id, s.name, s.status
            ORDER BY reliability_score DESC NULLS LAST
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    // Cost Analysis (incident impact estimation)
    async getIncidentCostAnalysis(dateRange = '30d') {
        const days = parseInt(dateRange.replace('d', ''));
        
        // Estimated cost per severity (in hours of engineering time)
        const costEstimates = {
            SEV1: 50, // $50/hr * avg engineers involved
            SEV2: 30,
            SEV3: 15,
            SEV4: 5
        };
        
        const query = `
            SELECT 
                severity,
                COUNT(*) as count,
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_duration_hours,
                SUM(
                    CASE severity
                        WHEN 'SEV1' THEN ${costEstimates.SEV1}
                        WHEN 'SEV2' THEN ${costEstimates.SEV2}
                        WHEN 'SEV3' THEN ${costEstimates.SEV3}
                        WHEN 'SEV4' THEN ${costEstimates.SEV4}
                    END * EXTRACT(EPOCH FROM (resolved_at - created_at))/3600
                ) as estimated_cost
            FROM incidents
            WHERE created_at >= NOW() - INTERVAL '${days} days'
                AND status = 'resolved'
            GROUP BY severity
            ORDER BY severity
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    // Predictive Analytics - Forecast incidents
    async forecastIncidents(days = 30) {
        const query = `
            WITH historical_data AS (
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                FROM incidents
                WHERE created_at >= NOW() - INTERVAL '90 days'
                GROUP BY DATE(created_at)
            )
            SELECT 
                AVG(count) as avg_daily_incidents,
                STDDEV(count) as stddev,
                AVG(count) * ${days} as forecasted_total,
                MAX(count) as peak_day_incidents
            FROM historical_data
        `;
        
        const result = await db.query(query);
        return result.rows[0];
    }

    // Time to Detection (MTTD) Analysis
    async getMTTDAnalysis(dateRange = '30d') {
        const days = parseInt(dateRange.replace('d', ''));
        
        const query = `
            SELECT 
                severity,
                AVG(EXTRACT(EPOCH FROM (
                    COALESCE(
                        (SELECT MIN(created_at) 
                         FROM incident_updates 
                         WHERE incident_id = i.id), 
                        i.updated_at
                    ) - i.created_at
                ))/60) as avg_mttd_minutes,
                PERCENTILE_CONT(0.95) WITHIN GROUP (
                    ORDER BY EXTRACT(EPOCH FROM (
                        COALESCE(
                            (SELECT MIN(created_at) 
                             FROM incident_updates 
                             WHERE incident_id = i.id), 
                            i.updated_at
                        ) - i.created_at
                    ))
                )/60 as p95_mttd_minutes
            FROM incidents i
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY severity
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    // Generate Custom Report
    async generateCustomReport(config) {
        const { metrics, dateRange, groupBy, filters } = config;
        
        // This would be extended to support dynamic report generation
        // based on user-selected metrics and dimensions
        
        return {
            generated_at: new Date(),
            config,
            data: await this.getExecutiveDashboard(dateRange)
        };
    }
}

module.exports = new AdvancedAnalytics();
