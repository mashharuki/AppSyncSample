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
  
- **Phase 3: AppSync GraphQL API** (Tasks 3.1-3.3)
  - ✅ GraphQL schema definition (`packages/cdk/lib/appsync/schema.graphql`)
    - 12 Query operations
    - 3 Mutation operations
    - 4 main entity types with relationships
    - 3 Connection types for pagination
    - 4 Input types for mutations
    - 3 Analytics types
  - ✅ AppSync Stack implementation completed
  - ✅ DynamoDB data sources connected

- **Phase 4: Customer Management Resolvers** (Tasks 4.1-4.3)
  - ✅ Customer CRUD operations (list, get, create)
  - ✅ Email search with GSI
  - ✅ Customer orders field resolver

- **Phase 5: Product Catalog Resolvers** (Tasks 5.1-5.2)
  - ✅ Product CRUD operations
  - ✅ Category filtering with GSI

- **Phase 6: Order Management Resolvers** (Tasks 6.1-6.3)
  - ✅ Order queries (list, get by customer)
  - ✅ Order creation with validation
  - ✅ Order detail Pipeline Resolver (multi-table join)

- **Phase 7: Analytics Resolvers** (Tasks 7.1, 7.3)
  - ✅ Sales summary aggregation
  - ✅ Customer statistics

- **Phase 8: Frontend Setup** (Tasks 8.1-8.3)
  - ✅ Vite + React + TypeScript project initialization
  - ✅ AWS Amplify v6 client integration
  - ✅ GraphQL Code Generation setup

- **Phase 9: Customer Management UI** (Tasks 9.1-9.3) - COMPLETED
  - ✅ Customer list page with pagination
  - ✅ Customer creation form component
    - Email validation (client-side)
    - Form reset on success
    - Error handling and display
    - TDD: 8/8 tests passing
  - ✅ Customer search form component (Task 9.3 - JUST COMPLETED)
    - Email-based customer search
    - searchCustomerByEmail GraphQL query integration
    - Search results displayed in table format
    - "顧客が見つかりません" message for no results
    - Client-side email validation
    - Loading and error states
    - TDD: 9/9 tests passing

- **Phase 10: Product Catalog UI** (Task 10.1) - JUST COMPLETED
  - ✅ Product list page implementation
    - Created `ProductListPage.tsx` component
    - Implemented listProducts query for all products
    - Product cards with responsive grid layout
    - Category filter dropdown (Electronics, Clothing, Books, Home, Sports)
    - Dynamic filtering with listProductsByCategory query
    - Pagination support (limit: 20, nextToken)
    - Loading states and error handling
    - Empty state message
    - TDD methodology: RED-GREEN-REFACTOR-VERIFY cycle
    - 10/10 new tests passing (46/46 total frontend tests)
    - Quality checks: ✅ 46/46 tests, ✅ Build, ✅ TypeScript
    - Follows project code style conventions

### Next Steps 🚀
- **Task 7.2**: Product ranking resolver implementation
- **Task 10.2**: Product creation form component
- **Tasks 11.x**: Order management UI pages
- **Task 12.1**: Dashboard analytics page
- **Tasks 13.x**: Integration and deployment

### Progress Summary
- **Total Tasks**: 54 subtasks across 13 major tasks
- **Completed**: 25 tasks
- **Remaining**: 29 tasks
- **Current Phase**: Frontend UI Implementation (Customer Management Complete, Product Catalog Started)

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
- ✅ GraphQL resolvers (Customer, Product, Order, Analytics)
- ✅ Customer management (backend + frontend list + create form)
- ✅ Product catalog with category filtering (backend complete)
- ✅ Order management with detailed views (backend complete, Pipeline Resolver)
- ⏳ Dashboard analytics (backend complete, frontend pending)
- ⏳ Frontend UI (2/5 pages complete: Customer list + create form)

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
- ✅ Completed Task 10.1: Product list page implementation
  - Created `ProductListPage.tsx` in card-based grid layout
  - Integrated listProducts and listProductsByCategory GraphQL queries
  - Category filter dropdown with dynamic query switching
  - Responsive card design showing: name, category badge, price, description
  - Pagination with limit=20 and Next button
  - Loading spinner and comprehensive error handling
  - Empty state for no products found
  - TDD methodology with full RED-GREEN-REFACTOR-VERIFY cycle:
    - RED: Created 10 failing tests covering all functionality
    - GREEN: Implemented component to pass all tests
    - REFACTOR: Fixed linting issues, organized imports, added button type
    - VERIFY: All 46 frontend tests passing, clean build
  - Test coverage: Product display, pagination, category filtering, error states, loading states
  - Code quality: ✅ Lint clean, ✅ TypeScript build, ✅ All tests passing
  - Follows all project code style conventions and patterns

- ✅ Completed Task 9.3: Customer search functionality implementation
  - Created `CustomerSearchForm.tsx` component
  - Implemented email-based search with searchCustomerByEmail query
  - Search results displayed in same table format as customer list
  - Shows "顧客が見つかりません" message when no results found
  - Client-side email validation before search
  - Loading state ("Searching...") during API call
  - Disabled button while searching
  - Comprehensive error handling
  - TDD methodology: RED-GREEN-REFACTOR-VERIFY cycle
  - 9/9 new tests passing (36/36 total frontend tests)
  - Quality checks: ✅ Lint, ✅ Build, ✅ All tests
  - Follows project code style conventions
