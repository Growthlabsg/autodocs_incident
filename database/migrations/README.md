# Database Migrations

This directory contains all database migrations for AutoDocs+AutoIncident.

## Migration Structure

Each migration consists of two files:
- `{version}_up.sql` - Applies the migration
- `{version}_down.sql` - Reverts the migration

## Running Migrations

### Apply All Migrations
```bash
./database/migrate.sh up
```

### Revert Last Migration
```bash
./database/migrate.sh down
```

### Check Migration Status
```bash
./database/migrate.sh status
```

## Creating New Migrations

```bash
./database/migrate.sh create add_new_feature
```

## Migration Order

1. `001_initial_schema` - Core tables (incidents, teams, users)
2. `002_tier2_features` - On-call, workflows, analytics
3. `003_tier3_ai` - AI features and embeddings
4. `004_tier4_roles` - Incident roles and Slack integration
5. `005_tier5_advanced` - Status pages, custom fields, alert routing
