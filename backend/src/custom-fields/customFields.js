// src/custom-fields/customFields.js
// Custom Fields System - Dynamic org-specific fields

const db = require('../config/database');

class CustomFieldsSystem {
    // Define custom field
    async defineField(orgId, fieldDefinition) {
        const {
            field_name,
            field_key,
            field_type, // text, select, multi_select, number, date, boolean, user
            is_required = false,
            options = [], // For select/multi_select
            default_value = null,
            description = null,
            applies_to = 'incident' // incident, service, user
        } = fieldDefinition;

        const result = await db.query(
            `INSERT INTO custom_field_definitions
             (org_id, field_name, field_key, field_type, is_required, options, default_value, description, applies_to, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             RETURNING *`,
            [orgId, field_name, field_key, field_type, is_required, JSON.stringify(options), default_value, description, applies_to]
        );

        console.log(`✅ Custom field "${field_name}" defined`);
        return result.rows[0];
    }

    // Get all custom fields for entity type
    async getFieldDefinitions(orgId, appliesTo = 'incident') {
        const result = await db.query(
            `SELECT * FROM custom_field_definitions
             WHERE org_id = $1 AND applies_to = $2 AND is_active = true
             ORDER BY display_order, created_at`,
            [orgId, appliesTo]
        );

        return result.rows;
    }

    // Set custom field value
    async setFieldValue(entityType, entityId, fieldKey, value) {
        // Get field definition
        const fieldDef = await db.query(
            'SELECT * FROM custom_field_definitions WHERE field_key = $1 AND applies_to = $2',
            [fieldKey, entityType]
        );

        if (fieldDef.rows.length === 0) {
            throw new Error(`Custom field "${fieldKey}" not found for ${entityType}`);
        }

        const field = fieldDef.rows[0];

        // Validate value
        const validatedValue = this.validateValue(value, field);

        // Store value
        await db.query(
            `INSERT INTO custom_field_values
             (field_definition_id, entity_type, entity_id, field_value, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (field_definition_id, entity_type, entity_id)
             DO UPDATE SET field_value = $4, updated_at = NOW()`,
            [field.id, entityType, entityId, JSON.stringify(validatedValue)]
        );

        return validatedValue;
    }

    // Get all custom field values for entity
    async getFieldValues(entityType, entityId) {
        const result = await db.query(
            `SELECT 
                cfd.field_name,
                cfd.field_key,
                cfd.field_type,
                cfv.field_value
             FROM custom_field_values cfv
             JOIN custom_field_definitions cfd ON cfv.field_definition_id = cfd.id
             WHERE cfv.entity_type = $1 AND cfv.entity_id = $2
             ORDER BY cfd.display_order`,
            [entityType, entityId]
        );

        // Parse JSON values
        return result.rows.map(row => ({
            ...row,
            field_value: JSON.parse(row.field_value)
        }));
    }

    // Get field value
    async getFieldValue(entityType, entityId, fieldKey) {
        const result = await db.query(
            `SELECT cfv.field_value
             FROM custom_field_values cfv
             JOIN custom_field_definitions cfd ON cfv.field_definition_id = cfd.id
             WHERE cfd.field_key = $1 AND cfv.entity_type = $2 AND cfv.entity_id = $3`,
            [fieldKey, entityType, entityId]
        );

        if (result.rows.length === 0) return null;
        return JSON.parse(result.rows[0].field_value);
    }

    // Validate value against field definition
    validateValue(value, fieldDefinition) {
        const { field_type, options, is_required } = fieldDefinition;

        if (is_required && (value === null || value === undefined || value === '')) {
            throw new Error(`Field "${fieldDefinition.field_name}" is required`);
        }

        switch (field_type) {
            case 'text':
                return String(value);

            case 'number':
                const num = parseFloat(value);
                if (isNaN(num)) {
                    throw new Error(`Field "${fieldDefinition.field_name}" must be a number`);
                }
                return num;

            case 'boolean':
                return Boolean(value);

            case 'date':
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error(`Field "${fieldDefinition.field_name}" must be a valid date`);
                }
                return date.toISOString();

            case 'select':
                const validOptions = JSON.parse(options || '[]');
                if (!validOptions.includes(value)) {
                    throw new Error(`Invalid option for "${fieldDefinition.field_name}"`);
                }
                return value;

            case 'multi_select':
                if (!Array.isArray(value)) {
                    throw new Error(`Field "${fieldDefinition.field_name}" must be an array`);
                }
                const validOpts = JSON.parse(options || '[]');
                for (const v of value) {
                    if (!validOpts.includes(v)) {
                        throw new Error(`Invalid option "${v}" for "${fieldDefinition.field_name}"`);
                    }
                }
                return value;

            case 'user':
                // Would validate user ID exists
                return value;

            default:
                return value;
        }
    }

    // Common custom fields templates
    async createCommonFields(orgId) {
        const commonFields = [
            {
                field_name: 'Affected Region',
                field_key: 'affected_region',
                field_type: 'select',
                options: ['US-East', 'US-West', 'EU', 'Asia-Pacific', 'Global'],
                description: 'Geographic region affected by this incident'
            },
            {
                field_name: 'Customer Tier',
                field_key: 'customer_tier',
                field_type: 'select',
                options: ['Enterprise', 'Business', 'Free', 'Internal'],
                description: 'Tier of affected customers'
            },
            {
                field_name: 'Product Area',
                field_key: 'product_area',
                field_type: 'select',
                options: ['API', 'Dashboard', 'Mobile App', 'Billing', 'Authentication'],
                description: 'Product area affected'
            },
            {
                field_name: 'Customer Impact',
                field_key: 'customer_impact',
                field_type: 'number',
                description: 'Estimated number of affected customers'
            },
            {
                field_name: 'Revenue Impact',
                field_key: 'revenue_impact',
                field_type: 'number',
                description: 'Estimated revenue impact in USD'
            }
        ];

        for (const field of commonFields) {
            await this.defineField(orgId, { ...field, applies_to: 'incident' });
        }

        console.log(`✅ Created ${commonFields.length} common custom fields`);
    }

    // Search incidents by custom field
    async searchByCustomField(fieldKey, value, orgId) {
        const result = await db.query(
            `SELECT DISTINCT i.*
             FROM incidents i
             JOIN custom_field_values cfv ON cfv.entity_id = i.id
             JOIN custom_field_definitions cfd ON cfv.field_definition_id = cfd.id
             WHERE cfd.field_key = $1
             AND cfd.org_id = $2
             AND cfv.entity_type = 'incident'
             AND cfv.field_value::jsonb @> $3::jsonb
             ORDER BY i.created_at DESC`,
            [fieldKey, orgId, JSON.stringify(value)]
        );

        return result.rows;
    }

    // Update field definition
    async updateFieldDefinition(fieldId, updates) {
        const { field_name, options, is_required, description, display_order } = updates;

        const setClauses = [];
        const values = [];
        let paramCount = 1;

        if (field_name !== undefined) {
            setClauses.push(`field_name = $${paramCount++}`);
            values.push(field_name);
        }
        if (options !== undefined) {
            setClauses.push(`options = $${paramCount++}`);
            values.push(JSON.stringify(options));
        }
        if (is_required !== undefined) {
            setClauses.push(`is_required = $${paramCount++}`);
            values.push(is_required);
        }
        if (description !== undefined) {
            setClauses.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (display_order !== undefined) {
            setClauses.push(`display_order = $${paramCount++}`);
            values.push(display_order);
        }

        if (setClauses.length === 0) return;

        values.push(fieldId);
        await db.query(
            `UPDATE custom_field_definitions SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
            values
        );
    }

    // Delete field definition (soft delete)
    async deleteFieldDefinition(fieldId) {
        await db.query(
            'UPDATE custom_field_definitions SET is_active = false WHERE id = $1',
            [fieldId]
        );
    }
}

module.exports = new CustomFieldsSystem();
