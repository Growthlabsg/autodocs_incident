// src/enterprise/multiTenancy.js
// Multi-tenancy Support

const db = require('../config/database');

class MultiTenancyService {
    async createTenant(data) {
        const { name, domain, plan, settings } = data;
        
        const result = await db.query(
            `INSERT INTO tenants (name, domain, plan, settings, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [name, domain, plan, JSON.stringify(settings)]
        );

        return result.rows[0];
    }

    async getTenant(id) {
        const result = await db.query(
            'SELECT * FROM tenants WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    async getTenantByDomain(domain) {
        const result = await db.query(
            'SELECT * FROM tenants WHERE domain = $1',
            [domain]
        );
        return result.rows[0];
    }

    async updateTenantSettings(tenantId, settings) {
        await db.query(
            'UPDATE tenants SET settings = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(settings), tenantId]
        );
    }

    // Middleware to inject tenant context
    tenantMiddleware() {
        return async (req, res, next) => {
            const domain = req.headers['x-tenant-domain'] || req.hostname;
            const tenant = await this.getTenantByDomain(domain);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            req.tenant = tenant;
            next();
        };
    }

    // Query filter for tenant isolation
    tenantFilter(tenantId) {
        return `tenant_id = '${tenantId}'`;
    }
}

module.exports = new MultiTenancyService();
