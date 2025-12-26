# Project Structure

## Monorepo Organization
This project follows a monorepo pattern with pnpm workspaces, separating concerns between infrastructure, backend logic, and frontend application.

## Expected Folder Structure
```
├── packages/
│   ├── cdk/                    # AWS CDK infrastructure code
│   │   ├── lib/
│   │   │   ├── dynamodb/       # DynamoDB table definitions
│   │   │   ├── appsync/        # AppSync API and resolvers
│   │   │   └── s3/             # S3 bucket configurations
│   │   └── bin/                # CDK app entry point
│   ├── frontend/               # React dashboard application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Dashboard pages
│   │   │   ├── graphql/        # GraphQL queries and mutations
│   │   │   └── types/          # TypeScript type definitions
│   │   └── public/             # Static assets
│   └── shared/                 # Shared types and utilities
│       └── types/              # Common TypeScript interfaces
├── docs/                       # Additional documentation
└── scripts/                    # Build and deployment scripts
```

## DynamoDB Table Design
Based on the design document, the project implements 4 main tables:
- **Customers** - Customer information with email GSI
- **Products** - Product catalog with category GSI  
- **Orders** - Order records with customer and date GSIs
- **OrderItems** - Order line items with product sales GSI

## AppSync Resolver Patterns
- **Pipeline Resolvers** for complex multi-table queries
- **Field Resolvers** for lazy loading related entities
- **Batch Resolvers** for efficient bulk data retrieval

## Naming Conventions
- **DynamoDB**: Use `PK`/`SK` pattern with entity prefixes (e.g., `CUSTOMER#`, `ORDER#`)
- **GraphQL**: Use PascalCase for types, camelCase for fields
- **Components**: Use PascalCase for React components
- **Files**: Use kebab-case for file names

## Key Directories
- Place GraphQL schema definitions in `packages/cdk/lib/appsync/`
- Store resolver mapping templates alongside schema files
- Keep frontend GraphQL operations in `packages/frontend/src/graphql/`
- Shared TypeScript types go in `packages/shared/types/`