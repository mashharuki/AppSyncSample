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
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/customers/listCustomers.js`
- `getCustomer(customerId: ID!): Customer`
  - Fetches single customer by ID
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/customers/getCustomer.js`
- `searchCustomerByEmail(email: String!): Customer`
  - Searches customer by email using email-gsi
  - ✅ **Task 4.2 COMPLETED**: Resolver implemented with TDD
  - Location: `packages/cdk/lib/appsync/resolvers/customers/searchCustomerByEmail.js`
  - Features:
    - Email format validation using regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
    - DynamoDB Query operation on email-gsi
    - Error handling for invalid email format and GSI query failures
    - Returns first matching customer (null if no match)

#### Product Queries
- `listProducts(limit: Int, nextToken: String): ProductConnection!`
  - Lists all products with pagination
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/products/listProducts.js`
- `getProduct(productId: ID!): Product`
  - Fetches single product by ID
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/products/getProduct.js`
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
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/customers/createCustomer.js`
- `createProduct(input: CreateProductInput!): Product!`
  - ✅ Resolver implemented: `packages/cdk/lib/appsync/resolvers/products/createProduct.js`
- `createOrder(input: CreateOrderInput!): Order!`

## Implemented Resolvers Status

### Customer Resolvers (5/5 completed) ✅
1. ✅ `listCustomers` - DynamoDB Scan with pagination
2. ✅ `getCustomer` - DynamoDB GetItem
3. ✅ `createCustomer` - DynamoDB PutItem with UUID generation
4. ✅ `searchCustomerByEmail` - DynamoDB Query on email-gsi (Task 4.2)
5. ✅ **`Customer.orders`** - Field Resolver with customer-order-gsi (Task 4.3)

### Product Resolvers (4/5 completed) ⚙️
1. ✅ `listProducts` - DynamoDB Scan with pagination (Task 5.1)
2. ✅ `getProduct` - DynamoDB GetItem (Task 5.1)
3. ✅ `createProduct` - DynamoDB PutItem with UUID generation and price validation (Task 5.1)
4. ✅ `listProductsByCategory` - DynamoDB Query on category-gsi (Task 5.2)
5. ⏳ `Product.orderItems` - Field Resolver (future)

### Field Resolvers Implemented
- ✅ **Customer.orders** - Lazy loading of customer's orders
  - Location: `packages/cdk/lib/appsync/resolvers/customers/Customer.orders.js`
  - Uses customer-order-gsi for efficient querying
  - Features:
    - Accesses parent object via `ctx.source.customerId`
    - DynamoDB Query on customer-order-gsi
    - Pagination support (limit, nextToken)
    - Sorted by orderDate descending (scanIndexForward: false)
    - Returns empty array if no orders found
    - Error handling with util.error()

### AppSync Stack Integration
All 8 resolvers (5 customer + 3 product) registered in `packages/cdk/lib/appsync/appsync-stack.ts`:
- Customer Resolvers: ListCustomersResolver, GetCustomerResolver, CreateCustomerResolver, SearchCustomerByEmailResolver, CustomerOrdersFieldResolver
- Product Resolvers: ListProductsResolver, GetProductResolver, CreateProductResolver (Task 5.1)
- Runtime: APPSYNC_JS 1.0.0
- Data Sources: CustomersDataSource, ProductsDataSource, OrdersDataSource

### Test Coverage
- All 29 resolver tests passing (16 customer + 13 product)
- Test files:
  - `packages/cdk/test/appsync/resolvers/customers.test.ts` (16 tests)
  - `packages/cdk/test/appsync/resolvers/products.test.ts` (13 tests) - Updated in Task 5.2
- Validates:
  - Query/Mutation resolvers
  - Field resolvers
  - Correct data source binding
  - APPSYNC_JS runtime configuration
  - Resolver counts

## Task 5.1 Implementation Details

### TDD Cycle (Kent Beck's Red-Green-Refactor)

#### RED Phase
- Created test file: `packages/cdk/test/appsync/resolvers/products.test.ts`
- Added 10 failing tests for product resolvers:
  - 3 tests for listProducts (resolver exists, data source, runtime)
  - 3 tests for getProduct (resolver exists, data source, runtime)
  - 3 tests for createProduct (resolver exists, data source, runtime)
  - 1 test for resolver count validation
- All tests failed as expected (resolvers not implemented)

#### GREEN Phase
1. Created `listProducts.js` resolver:
   - DynamoDB Scan operation
   - Pagination support (limit: 20 default, nextToken)
   - Returns items and nextToken in ProductConnection format
   - Error handling with util.error()

2. Created `getProduct.js` resolver:
   - DynamoDB GetItem operation
   - Single product lookup by productId
   - Returns product or null if not found
   - Error handling with util.error()

3. Created `createProduct.js` resolver:
   - UUID v4 generation with util.autoId()
   - Price validation (must be positive number)
   - Category normalization (toLowerCase)
   - DynamoDB PutItem operation
   - Timestamp generation with util.time.nowISO8601()
   - Error handling for validation and DynamoDB errors

4. Integrated resolvers into AppSyncStack:
   - Removed @ts-expect-error from productsDataSource
   - Registered 3 resolvers with ProductsDataSource
   - All 10 tests passed

#### REFACTOR Phase
- Fixed lint errors:
  - Removed unused variable warning (_orderItemsDataSource)
  - Fixed `any` type usage with biome-ignore comments
- Ran formatter (3 files formatted)
- Ran lint check (passed)
- Ran build check (passed)
- All 62 tests passing (including 10 new product tests)

### Code Quality Checks (Task 5.1)
✅ Lint: No errors
✅ Build: TypeScript compilation successful
✅ Tests: 62/62 passing (26 resolver tests)
✅ Format: Biome compliant

## Task 5.2 Implementation Details

### TDD Cycle (Kent Beck's Red-Green-Refactor)

#### RED Phase
- Added 3 failing tests to `packages/cdk/test/appsync/resolvers/products.test.ts`:
  1. listProductsByCategory resolver attached to Query.listProductsByCategory
  2. Uses ProductsDataSource
  3. Uses APPSYNC_JS runtime
- Updated resolver count test from 3 to 4 product resolvers
- All tests failed as expected (resolver not implemented)

#### GREEN Phase
1. Created `listProductsByCategory.js` resolver:
   - DynamoDB Query operation on category-gsi index
   - Category normalization (toLowerCase) for consistent querying
   - Pagination support (limit: 20 default, nextToken)
   - GSI query with expression `category = :category`
   - Returns ProductConnection format (items, nextToken)
   - Error handling with util.error()
2. Integrated resolver into AppSyncStack:
   - Registered ListProductsByCategoryResolver with ProductsDataSource
   - All 13 product tests passed (10 existing + 3 new)

#### REFACTOR Phase
- Ran Biome formatter (no changes needed - already compliant)
- Ran Biome lint check (passed)
- All 65 tests passing (no regressions)
- Clean code with proper comments

### Code Quality Checks (Task 5.2)
✅ Lint: No errors
✅ Build: TypeScript compilation successful
✅ Tests: 65/65 passing (29 resolver tests)
✅ Format: Biome compliant

### Implementation Details
- **Price Validation**: Enforces `price > 0` in createProduct resolver
- **Category Normalization**: Converts category to lowercase for consistent querying
- **UUID Generation**: Uses util.autoId() for productId
- **Pagination Pattern**: Same as customer resolvers (limit, nextToken)
- **Error Handling**: Consistent util.error() pattern across all resolvers

## Task 4.3 Implementation Details

### TDD Cycle (Kent Beck's Red-Green-Refactor)

#### RED Phase
- Added 3 failing tests for Customer.orders field resolver:
  1. Field resolver attached to Customer.orders
  2. Uses OrdersDataSource
  3. Uses APPSYNC_JS runtime
- Updated resolver count test from 4 to 5
- All tests failed as expected (field resolver not implemented)

#### GREEN Phase
1. Created `Customer.orders.js` field resolver:
   - Field resolver pattern: accesses parent via ctx.source
   - DynamoDB Query on customer-order-gsi index
   - customerIdをパーティションキー、orderDateをソートキー
   - Pagination support (limit: 20 default, nextToken)
   - Sorted by orderDate descending (latest orders first)
   - Returns empty array if no orders
   - Error handling with util.error()
2. Integrated field resolver into AppSyncStack:
   - Removed @ts-expect-error from ordersDataSource
   - Registered as typeName: 'Customer', fieldName: 'orders'
3. All tests passed (16/16 passing)

#### REFACTOR Phase
- Ran lint check (passed)
- Ran build check (passed)
- All tests still passing after refactor
- Clean code with proper comments

### Code Quality Checks
✅ Lint: No errors
✅ Build: TypeScript compilation successful
✅ Tests: 16/16 passing
✅ Format: Biome compliant

## Entity Types (4 main types)

#### Customer Type
```graphql
type Customer {
  customerId: ID!
  name: String!
  email: String!
  orders: [Order!]!  # ✅ Field Resolver implemented (Task 4.3)
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
- **GetItem**: ✅ `getCustomer`, `getProduct`, `getOrder` (base data only)
- **Scan**: ✅ `listCustomers`, `listProducts`, `listOrders`
- **Query (GSI)**: ✅ `searchCustomerByEmail`, `listProductsByCategory`, `listOrdersByCustomer`

### Field Resolvers (Lazy loading)
- ✅ `Customer.orders` → Query customer-order-gsi (Task 4.3)
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
  - GSI: email-gsi (PK: email, Projection: ALL)
  
- **Products Table** ↔ `Product` type
  - PK: productId, SK: productId
  - GSI: category-gsi (PK: category)
  
- **Orders Table** ↔ `Order` type
  - PK: orderId, SK: orderId
  - GSI: customer-order-gsi (PK: customerId, SK: orderDate, Projection: ALL)
  - ✅ Used by Customer.orders field resolver
  
- **OrderItems Table** ↔ `OrderItem` type
  - PK: orderItemId, SK: orderItemId
  - GSI: product-sales-gsi (PK: productId)

## Next Implementation Steps

### Tasks 5.x: Product Resolvers
- 5.1: Product CRUD basic resolvers
- 5.2: Category filtering resolver

### Tasks 6.x: Order Resolvers
- 6.1: Order basic query resolvers
- 6.2: Order creation mutation
- 6.3: Order details pipeline resolver (multi-table join)

### Tasks 7.x: Analytics Resolvers
- 7.1: Sales summary resolver
- 7.2: Product ranking resolver
- 7.3: Customer stats resolver

## Design Decisions

### Why Customer.orders is Field Resolver?
- ✅ **Implemented in Task 4.3**
- Lazy loading: Only fetch orders when explicitly requested
- Avoid over-fetching data in list operations
- Pagination support for large order histories
- Efficient querying using customer-order-gsi

### Why scanIndexForward: false?
- Latest orders appear first (descending order by orderDate)
- Better UX: Users typically want to see recent orders
- GraphQL clients can reverse if needed

### Why Return Empty Array Instead of Null?
- GraphQL schema defines `orders: [Order!]!` (non-null array)
- Empty array is valid for "no orders found"
- Consistent with DynamoDB Query behavior
- Simplifies client-side handling (no null checks)

## File Locations
- Schema: `packages/cdk/lib/appsync/schema.graphql` (135 lines)
- Tests: 
  - `packages/cdk/lib/appsync/schema.test.ts` (172 lines)
  - `packages/cdk/test/appsync/resolvers/customers.test.ts` (16 tests)
  - `packages/cdk/test/appsync/resolvers/products.test.ts` (10 tests) ✅ Task 5.1
- AppSync Stack: `packages/cdk/lib/appsync/appsync-stack.ts`
- Customer Resolvers:
  - `listCustomers.js` ✅
  - `getCustomer.js` ✅
  - `createCustomer.js` ✅
  - `searchCustomerByEmail.js` ✅ (Task 4.2)
  - `Customer.orders.js` ✅ (Task 4.3 - Field Resolver)
- Product Resolvers:
  - `listProducts.js` ✅ (Task 5.1)
  - `getProduct.js` ✅ (Task 5.1)
  - `createProduct.js` ✅ (Task 5.1)
  - `listProductsByCategory.js` ✅ (Task 5.2)
