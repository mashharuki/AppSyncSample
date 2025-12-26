# Code Style and Conventions

## Formatter & Linter
This project uses **Biome** (replaces ESLint + Prettier) for both linting and formatting.

## Formatting Rules
- **Indent**: 2 spaces (no tabs)
- **Line width**: 100 characters maximum
- **Line ending**: LF (Unix-style)
- **Quote style**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Always required
- **Trailing commas**: Always (including function arguments)
- **Arrow parentheses**: Always use parentheses

## TypeScript Guidelines
- **Explicit any**: Warnings enabled - avoid using `any`, prefer specific types
- **Unused variables**: Error - all variables must be used
- **Undeclared variables**: Error - all variables must be declared
- Use `const` by default, `let` when reassignment is needed
- Never use `var`
- Prefer template literals over string concatenation

## Naming Conventions
### DynamoDB
- Use `PK`/`SK` pattern for partition and sort keys
- Entity prefixes in keys: `CUSTOMER#`, `ORDER#`, `PRODUCT#`, `ITEM#`
- GSI naming: descriptive names like `EmailIndex`, `CategoryIndex`, `CustomerOrdersIndex`

### GraphQL
- **Types**: PascalCase (e.g., `OrderDetail`, `Customer`)
- **Fields**: camelCase (e.g., `customerId`, `orderDate`)
- **Queries/Mutations**: camelCase with verb prefix (e.g., `getOrderDetail`, `createCustomer`)

### TypeScript/React
- **Components**: PascalCase (e.g., `CustomerList`, `OrderDetail`)
- **Files**: kebab-case (e.g., `customer-list.tsx`, `order-detail.tsx`)
- **Variables/Functions**: camelCase (e.g., `fetchOrders`, `customerData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINT`, `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `CustomerData`, `OrderItem`)

## File Organization
- GraphQL schema definitions: `packages/cdk/lib/appsync/`
- Resolver mapping templates: alongside schema files
- Frontend GraphQL operations: `packages/frontend/src/graphql/`
- Shared TypeScript types: `packages/shared/types/`
- React components: `packages/frontend/src/components/`
- Pages: `packages/frontend/src/pages/`

## Import Organization
Biome automatically organizes imports:
- External dependencies first
- Internal imports second
- Sorted alphabetically within each group

## Error Handling
- Use proper TypeScript error types
- No empty catch blocks
- No debugger statements in production code

## Best Practices
- Enable `organizeImports` - imports are automatically sorted
- Run `pnpm format` before committing
- All linting rules are set to "error" level - code must pass checks
- Use strict TypeScript configuration
- Prefer functional components in React
- Use GraphQL Pipeline Resolvers for multi-table queries
