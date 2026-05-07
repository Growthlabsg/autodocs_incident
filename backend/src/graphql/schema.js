// src/graphql/schema.js
// GraphQL Schema for Advanced API

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Incident {
    id: ID!
    incident_number: String!
    title: String!
    description: String
    severity: Severity!
    status: Status!
    service: Service
    assignees: [User!]
    updates: [IncidentUpdate!]
    created_at: String!
    updated_at: String!
    resolved_at: String
  }

  type IncidentUpdate {
    id: ID!
    incident_id: ID!
    message: String!
    user: User!
    created_at: String!
  }

  type Service {
    id: ID!
    name: String!
    description: String
    status: ServiceStatus!
    incidents: [Incident!]
  }

  type User {
    id: ID!
    email: String!
    first_name: String!
    last_name: String!
    role: String!
  }

  type Team {
    id: ID!
    name: String!
    description: String
    members: [User!]
  }

  type Analytics {
    total_incidents: Int!
    sev1_count: Int!
    sev2_count: Int!
    avg_mttr_hours: Float
    sla_compliance: Float
  }

  type Workflow {
    id: ID!
    name: String!
    description: String
    trigger_event: String!
    is_active: Boolean!
    definition: String!
  }

  enum Severity {
    SEV1
    SEV2
    SEV3
    SEV4
  }

  enum Status {
    investigating
    monitoring
    resolved
  }

  enum ServiceStatus {
    operational
    degraded
    outage
    maintenance
  }

  type Query {
    # Incidents
    incidents(
      status: Status
      severity: Severity
      limit: Int
      offset: Int
    ): [Incident!]!
    
    incident(id: ID!): Incident
    
    # Services
    services: [Service!]!
    service(id: ID!): Service
    
    # Users & Teams
    users: [User!]!
    user(id: ID!): User
    teams: [Team!]!
    team(id: ID!): Team
    
    # Analytics
    analytics(dateRange: String): Analytics!
    
    # Workflows
    workflows: [Workflow!]!
    workflow(id: ID!): Workflow
  }

  type Mutation {
    # Incidents
    createIncident(
      title: String!
      description: String!
      severity: Severity!
      service_id: ID
    ): Incident!
    
    updateIncident(
      id: ID!
      title: String
      description: String
      severity: Severity
      status: Status
    ): Incident!
    
    assignIncident(
      incident_id: ID!
      user_id: ID!
    ): Incident!
    
    addIncidentUpdate(
      incident_id: ID!
      message: String!
    ): IncidentUpdate!
    
    # Services
    createService(
      name: String!
      description: String
      status: ServiceStatus
    ): Service!
    
    updateService(
      id: ID!
      name: String
      description: String
      status: ServiceStatus
    ): Service!
    
    # Workflows
    createWorkflow(
      name: String!
      description: String
      trigger_event: String!
      definition: String!
    ): Workflow!
    
    updateWorkflow(
      id: ID!
      name: String
      description: String
      is_active: Boolean
      definition: String
    ): Workflow!
  }

  type Subscription {
    incidentCreated: Incident!
    incidentUpdated(id: ID!): Incident!
  }
`;

module.exports = typeDefs;
