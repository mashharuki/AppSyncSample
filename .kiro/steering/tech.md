# Technology Stack

## Architecture
- **Monorepo structure** using pnpm workspaces
- **AWS serverless** backend with CDK for infrastructure as code
- **React + TypeScript** frontend with Vite build system

## Backend Stack
- **AWS CDK** - Infrastructure as Code
- **DynamoDB** - NoSQL database with GSI indexes for complex queries
- **AppSync** - GraphQL API with pipeline resolvers for multi-table joins
- **S3** - Static asset storage

## Frontend Stack
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **GraphQL libraries** - For AppSync API integration

## Development Tools
- **Biome** - Linting and formatting (replaces ESLint + Prettier)
- **pnpm** - Package manager for monorepo

## Common Commands

### Package Management
```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm add <package> --filter <workspace-name>
```

### Development
```bash
# Start frontend dev server
pnpm dev

# Build for production
pnpm build

# Run linting and formatting
pnpm lint
pnpm format
```

### AWS Deployment
```bash
# Deploy CDK stack
pnpm deploy

# Synthesize CloudFormation template
pnpm synth

# Destroy stack
pnpm destroy
```

## Key Patterns
- **Pipeline Resolvers** in AppSync for multi-table data aggregation
- **GSI indexes** in DynamoDB for efficient querying patterns
- **Field Resolvers** for lazy loading related data in GraphQL