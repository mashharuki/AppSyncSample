# Project Overview

## Purpose
Learning project to understand how to build a dashboard application using AppSync + DynamoDB for multi-table data queries without traditional SQL joins.

## Scenario
Building an EC site dashboard that displays data spanning multiple DynamoDB tables. Since DynamoDB doesn't support table joins, this project explores using AppSync's GraphQL API as a solution to efficiently combine data from multiple tables.

## Technology Stack
### Backend
- **AWS CDK** - Infrastructure as Code (TypeScript)
- **DynamoDB** - NoSQL database with 4 tables:
  - Customers (with EmailIndex GSI)
  - Products (with CategoryIndex GSI)
  - Orders (with CustomerOrdersIndex and OrderDateIndex GSIs)
  - OrderItems (with ProductSalesIndex GSI)
- **AppSync** - GraphQL API with resolver patterns:
  - Pipeline Resolvers for complex multi-table queries
  - Field Resolvers for lazy loading
  - Batch Resolvers for bulk data retrieval
- **S3** - Static asset storage

### Frontend (Planned)
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **GraphQL client libraries** - For AppSync integration

### Development Tools
- **pnpm** - Package manager (monorepo support)
- **Biome** - Unified linter and formatter
- **Vitest** - Testing framework
- **TypeScript** - Type system

## Monorepo Structure
```
packages/
├── cdk/        # AWS infrastructure (CDK constructs)
├── frontend/   # React dashboard (planned)
└── shared/     # Shared types and utilities
```

## Key Features (Planned)
- Customer management and search
- Product catalog with category filtering
- Order management with detailed views
- Dashboard analytics:
  - Sales summary
  - Product rankings
  - Customer statistics
- Multi-table data aggregation via GraphQL resolvers

## Target Users
Developers learning AWS serverless architecture, specifically the AppSync + DynamoDB combination for handling complex data relationships.

## Development Approach
This project follows **Kiro-style Spec-Driven Development** on AI-DLC (AI Development Life Cycle):
- Steering documents in `.kiro/steering/` guide AI with project-wide rules
- Specifications in `.kiro/specs/` formalize development for individual features
- Current active spec: `appsync-multi-table-dashboard`

## System Information
- **Platform**: macOS (Darwin)
- **Node.js**: >=20.0.0
- **pnpm**: >=9.0.0
- **TypeScript**: ~5.3.0 (CDK), ^5.7.2 (root)
