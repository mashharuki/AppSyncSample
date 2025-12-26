# Project Overview

## Purpose
Learning project to understand how to build a dashboard application using AppSync + DynamoDB for multi-table data queries without traditional SQL joins.

## Scenario
Building an EC site dashboard that displays data spanning multiple DynamoDB tables. Since DynamoDB doesn't support table joins, this project explores using AppSync's GraphQL API as a solution to efficiently combine data from multiple tables.

## Current Status (Updated: 2025-12-27)

### Completed Tasks ✅
- **Phase 1: Project Foundation** (Tasks 1.1-1.2)
  - Monorepo configuration with pnpm workspaces
  - Shared type definitions package
  
- **Phase 2: DynamoDB Infrastructure** (Tasks 2.1-2.3)
  - 4 DynamoDB tables with GSI indexes defined
  - DynamoDB CDK stack implementation
  - CDK deployment validation completed
  
- **Phase 3: AppSync GraphQL API** (Task 3.1 - JUST COMPLETED)
  - ✅ GraphQL schema definition (`packages/cdk/lib/appsync/schema.graphql`)
    - 12 Query operations
    - 3 Mutation operations
    - 4 main entity types with relationships
    - 3 Connection types for pagination
    - 4 Input types for mutations
    - 3 Analytics types
  - ✅ Schema validation tests (10 tests, all passing)
  - ✅ TypeScript compilation successful

### Next Steps 🚀
- **Task 3.2**: AppSync Stack class implementation
- **Task 3.3**: DynamoDB data source connections
- **Tasks 4.x-7.x**: Resolver implementations (Customers, Products, Orders, Analytics)
- **Tasks 8.x-12.x**: Frontend React application
- **Tasks 13.x**: Integration and deployment

### Progress Summary
- **Total Tasks**: 54 subtasks across 13 major tasks
- **Completed**: 7 tasks (1.1, 1.2, 2.1, 2.2, 2.3, 3.1)
- **Remaining**: 47 tasks
- **Current Phase**: AppSync GraphQL API Infrastructure (3/3 tasks in section 3)

## Technology Stack
### Backend
- **AWS CDK** - Infrastructure as Code (TypeScript)
- **DynamoDB** - NoSQL database with 4 tables:
  - Customers (with email-gsi)
  - Products (with category-gsi)
  - Orders (with customer-order-gsi)
  - OrderItems (with product-sales-gsi)
- **AppSync** - GraphQL API with resolver patterns:
  - Pipeline Resolvers for complex multi-table queries
  - Field Resolvers for lazy loading
  - Batch Resolvers for bulk data retrieval
- **S3** - Static asset storage

### Frontend (Planned)
- **React 18** - UI framework
- **TypeScript 5.x** - Type safety
- **Vite 5.x** - Build tool
- **AWS Amplify v6** - GraphQL client for AppSync integration

### Development Tools
- **pnpm 9.x** - Package manager (monorepo support)
- **Biome 1.x** - Unified linter and formatter
- **Vitest** - Testing framework
- **TypeScript ~5.3.0** - Type system

## Monorepo Structure
```
packages/
├── cdk/              # AWS infrastructure (CDK constructs)
│   ├── lib/
│   │   ├── dynamodb/ # DynamoDB table definitions ✅
│   │   └── appsync/  # AppSync API and schema ✅ (schema only)
│   └── bin/          # CDK app entry point
├── frontend/         # React dashboard (NOT STARTED)
└── shared/           # Shared types and utilities ✅
```

## Key Features Implementation Status
- ✅ DynamoDB table structure (4 tables with GSIs)
- ✅ GraphQL schema definition
- ⏳ GraphQL resolvers (NOT STARTED)
- ⏳ Customer management and search (NOT STARTED)
- ⏳ Product catalog with category filtering (NOT STARTED)
- ⏳ Order management with detailed views (NOT STARTED)
- ⏳ Dashboard analytics (NOT STARTED)
- ⏳ Frontend UI (NOT STARTED)

## Target Users
Developers learning AWS serverless architecture, specifically the AppSync + DynamoDB combination for handling complex data relationships.

## Development Approach
This project follows **Kiro-style Spec-Driven Development** on AI-DLC (AI Development Life Cycle):
- Steering documents in `.kiro/steering/` guide AI with project-wide rules
- Specifications in `.kiro/specs/` formalize development for individual features
- Current active spec: `appsync-multi-table-dashboard`
  - Phase: `tasks-generated`
  - All approvals: ✅ Requirements, Design, Tasks
  - Ready for implementation: ✅

## System Information
- **Platform**: macOS (Darwin 23.5.0)
- **Working Directory**: `/Users/harukikondo/git/AppSyncSample/packages/cdk`
- **Git Status**: Clean (main branch)
- **Node.js**: >=20.0.0
- **pnpm**: >=9.0.0
- **TypeScript**: ~5.3.0 (CDK), ^5.7.2 (root)

## Recent Accomplishments (2025-12-27)
- Implemented GraphQL schema with comprehensive type definitions
- Created validation test suite (10 tests, 100% passing)
- Followed TDD methodology (RED-GREEN-REFACTOR cycle)
- Schema covers all requirements: 12 queries, 3 mutations, 10 custom types
- No TypeScript errors, clean build
