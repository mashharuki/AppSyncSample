# GraphQL Schema Implementation Details

## Overview
GraphQL schema for AppSync multi-table dashboard, located at:
`packages/cdk/lib/appsync/schema.graphql`

Implemented with TDD approach (10 validation tests, all passing).

## Schema Structure Summary

### Query Operations (12 total)

#### Customer Queries
- `listCustomers(limit: Int, nextToken: String): CustomerConnection!`
  - Lists all customers with pagination
- `getCustomer(customerId: ID!): Customer`
  - Fetches single customer by ID
- `searchCustomerByEmail(email: String!): Customer`
  - Searches customer by email using email-gsi

#### Product Queries
- `listProducts(limit: Int, nextToken: String): ProductConnection!`
  - Lists all products with pagination
- `getProduct(productId: ID!): Product`
  - Fetches single product by ID
- `listProductsByCategory(category: String!, limit: Int, nextToken: String): ProductConnection!`
  - Filters products by category using category-gsi

#### Order Queries
- `listOrders(limit: Int, nextToken: String): OrderConnection!`
  - Lists all orders with pagination
- `getOrder(orderId: ID!): Order`
  - Fetches single order by ID (will use Pipeline Resolver for multi-table join)
- `listOrdersByCustomer(customerId: ID!, limit: Int, nextToken: String): OrderConnection!`
  - Filters orders by customer using customer-order-gsi

#### Analytics Queries
- `getSalesSummary: SalesSummary!`
  - Returns total revenue, order count, average order value
- `getProductRanking(limit: Int): [ProductRanking!]!`
  - Returns top-selling products by quantity
- `getCustomerStats: CustomerStats!`
  - Returns total customers and active customers count

### Mutation Operations (3 total)
- `createCustomer(input: CreateCustomerInput!): Customer!`
- `createProduct(input: CreateProductInput!): Product!`
- `createOrder(input: CreateOrderInput!): Order!`

### Entity Types (4 main types)

#### Customer Type
```graphql
type Customer {
  customerId: ID!
  name: String!
  email: String!
  orders: [Order!]!  # Field Resolver - lazy load customer's orders
}
```

#### Product Type
```graphql
type Product {
  productId: ID!
  name: String!
  category: String!
  price: Float!
  description: String
}
```

#### Order Type
```graphql
type Order {
  orderId: ID!
  customerId: ID!
  customer: Customer!        # Field/Pipeline Resolver - fetch related customer
  orderDate: String!
  totalAmount: Float!
  status: String!
  orderItems: [OrderItem!]!  # Batch Resolver - fetch related items
}
```

#### OrderItem Type
```graphql
type OrderItem {
  orderItemId: ID!
  orderId: ID!
  productId: ID!
  quantity: Int!
  unitPrice: Float!
  product: Product!  # Field Resolver - fetch related product
}
```

### Connection Types (for pagination)
- `CustomerConnection { items: [Customer!]!, nextToken: String }`
- `ProductConnection { items: [Product!]!, nextToken: String }`
- `OrderConnection { items: [Order!]!, nextToken: String }`

### Input Types (for mutations)
- `CreateCustomerInput { name: String!, email: String! }`
- `CreateProductInput { name: String!, category: String!, price: Float!, description: String }`
- `CreateOrderInput { customerId: ID!, orderItems: [CreateOrderItemInput!]! }`
- `CreateOrderItemInput { productId: ID!, quantity: Int! }`

### Analytics Types
- `SalesSummary { totalRevenue: Float!, orderCount: Int!, averageOrderValue: Float! }`
- `ProductRanking { productId: ID!, productName: String!, totalQuantity: Int! }`
- `CustomerStats { totalCustomers: Int!, activeCustomers: Int! }`

## Resolver Patterns to Implement

### Simple Resolvers (Direct DynamoDB operations)
- **GetItem**: `getCustomer`, `getProduct`, `getOrder` (base data only)
- **Scan**: `listCustomers`, `listProducts`, `listOrders`
- **Query (GSI)**: `searchCustomerByEmail`, `listProductsByCategory`, `listOrdersByCustomer`

### Field Resolvers (Lazy loading)
- `Customer.orders` → Query customer-order-gsi
- `Order.customer` → GetItem from Customers table
- `OrderItem.product` → GetItem from Products table

### Batch Resolvers (N+1 prevention)
- `Order.orderItems` → BatchGetItem from OrderItems table

### Pipeline Resolvers (Multi-table joins)
- `getOrder` full details:
  1. GetItem from Orders table
  2. GetItem from Customers table (using customerId)
  3. Query OrderItems table (using orderId)
  4. BatchGetItem from Products table (using productIds)

### Analytics Resolvers (Aggregation logic)
- `getSalesSummary` → Scan Orders, aggregate in resolver
- `getProductRanking` → Scan OrderItems, group by productId, sort by quantity
- `getCustomerStats` → Scan Customers + Orders, filter by date

## DynamoDB Mapping

### Table → Type Mapping
- **Customers Table** ↔ `Customer` type
  - PK: customerId, SK: customerId
  - GSI: email-gsi (PK: email)
  
- **Products Table** ↔ `Product` type
  - PK: productId, SK: productId
  - GSI: category-gsi (PK: category)
  
- **Orders Table** ↔ `Order` type
  - PK: orderId, SK: orderId
  - GSI: customer-order-gsi (PK: customerId, SK: orderDate)
  
- **OrderItems Table** ↔ `OrderItem` type
  - PK: orderItemId, SK: orderItemId
  - GSI: product-sales-gsi (PK: productId)

## Validation & Testing

### Test Coverage (`schema.test.ts`)
1. Schema loads and parses successfully
2. Query type has all 12 required operations
3. Mutation type has all 3 required operations
4. Customer type has all required fields
5. Product type has all required fields
6. Order type has all required fields and relationships
7. OrderItem type has all required fields
8. Connection types defined for pagination
9. Input types defined for mutations
10. Analytics types defined

**Test Result**: ✅ 10/10 passing

### Build Verification
- TypeScript compilation: ✅ Success (no errors)
- GraphQL syntax validation: ✅ Valid schema
- No linting errors: ✅ Clean

## Next Implementation Steps

### Task 3.2: AppSync Stack Class
- Create `packages/cdk/lib/appsync/appsync-stack.ts`
- Import schema.graphql using `SchemaFile.fromAsset()`
- Configure GraphqlApi with API_KEY auth
- Set up CloudWatch Logs (DEBUG level)
- Add CORS configuration
- Output API endpoint and API key

### Task 3.3: Data Source Connections
- Create DynamoDbDataSource for each table:
  - CustomersDataSource
  - ProductsDataSource
  - OrdersDataSource
  - OrderItemsDataSource
- IAM roles auto-generated for ReadWrite access

### Tasks 4.x-7.x: Resolver Implementation
- APPSYNC_JS runtime (JavaScript resolvers)
- Place in `packages/cdk/lib/appsync/resolvers/` subdirectories
- Follow patterns: customers/, products/, orders/, analytics/

## Design Decisions

### Why Customer.orders is Field Resolver?
- Lazy loading: Only fetch orders when explicitly requested
- Avoid over-fetching data in list operations
- Pagination support for large order histories

### Why Order.customer uses Pipeline Resolver?
- Part of complex getOrder operation
- Combines multiple table lookups in single request
- Reduces client-side round trips

### Why Order.orderItems uses Batch Resolver?
- Prevents N+1 query problem
- Single BatchGetItem for multiple items
- More efficient than individual GetItem calls

### Why Analytics use Scan?
- Learning project: Simplicity over performance
- Future: Use DynamoDB Streams + aggregate table
- Acceptable for small datasets in demo environment

## Schema Best Practices Applied
✅ Non-null types (`!`) for required fields
✅ Connection pattern for pagination
✅ Input types separate from entity types
✅ Field resolvers for lazy loading
✅ Descriptive names (camelCase for fields, PascalCase for types)
✅ Comments not needed (self-documenting schema)

## File Locations
- Schema: `packages/cdk/lib/appsync/schema.graphql` (135 lines)
- Tests: `packages/cdk/lib/appsync/schema.test.ts` (172 lines)
- Next: `packages/cdk/lib/appsync/appsync-stack.ts` (to be created)
