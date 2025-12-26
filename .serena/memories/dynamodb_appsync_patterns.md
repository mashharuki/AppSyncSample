# DynamoDB & AppSync Implementation Patterns

## DynamoDB Design Patterns

### Table Structure
This project uses **Multiple Tables Design** (not Single Table Design) for learning purposes:
- **Customers** - Customer data with email GSI for lookup
- **Products** - Product catalog with category GSI for filtering
- **Orders** - Order records with customer and date GSIs for queries
- **OrderItems** - Order line items with product sales GSI for analytics

### Key Patterns
- **PK/SK Pattern**: Use entity prefixes (e.g., `CUSTOMER#uuid`, `ORDER#uuid`)
- **GSI Strategy**: Create GSIs for different access patterns
- **Data Denormalization**: Store snapshot data (e.g., `unitPrice` in OrderItems)
- **Composite Keys**: Use `STATUS#status` pattern for filtering

### Common Access Patterns
1. Get entity by ID: Query by PK
2. Get related entities: Use GSI (e.g., CustomerOrdersIndex)
3. Filter by category/status: Use GSI with begins_with
4. Time-range queries: Use GSI with date as SK

## AppSync Resolver Patterns

### 1. Pipeline Resolver (Recommended for Complex Queries)
Use for multi-step data fetching:
```
Step 1: Get Order from Orders table
Step 2: Get Customer from Customers table (using customerId)
Step 3: Get OrderItems from OrderItems table (using orderId)
Step 4: Get Products from Products table (using productIds)
```

Example use case: `getOrderDetail` query that returns order + customer + items + products

### 2. Field Resolver
Use for lazy loading related data:
- Define resolver at field level (e.g., `Order.customer` field)
- Fetches data only when field is requested
- Useful for optional nested data

Example:
```graphql
type Order {
  orderId: ID!
  customer: Customer!  # Field resolver fetches from Customers table
  items: [OrderItem!]! # Field resolver fetches from OrderItems table
}
```

### 3. Batch Resolver
Use for bulk operations:
- Use `BatchGetItem` operation
- Reduces number of DynamoDB calls
- Efficient for fetching multiple items by IDs

Example: Fetching multiple products for order items in one call

### Key Considerations
- **N+1 Problem**: Use batch resolvers to avoid multiple single-item queries
- **Data Consistency**: OrderItems stores `unitPrice` to preserve historical pricing
- **Aggregation**: Use Lambda functions for complex calculations (sales summaries, rankings)
- **Caching**: Consider AppSync caching for frequently accessed data

## GraphQL Schema Design

### Type Relationships
```graphql
# Main entities
type Customer { ... }
type Product { ... }
type Order { 
  customer: Customer!    # Resolved via Field Resolver
  items: [OrderItem!]!   # Resolved via Pipeline/Field Resolver
}
type OrderItem {
  product: Product!      # Resolved via Field Resolver
}

# Aggregated types
type OrderDetail {
  order: Order!
  customer: Customer!
  items: [OrderItemDetail!]!
}
```

### Query Patterns
- **Get by ID**: `getCustomer(customerId: ID!): Customer`
- **List with filter**: `listProducts(category: String): [Product!]!`
- **Nested data**: `getOrderDetail(orderId: ID!): OrderDetail`
- **Analytics**: `salesSummary(startDate: AWSDateTime!, endDate: AWSDateTime!): SalesSummary`

## Performance Tips
1. Use GSIs for filtering/sorting - avoid scans
2. Implement pagination for large result sets
3. Use batch operations when fetching multiple items
4. Consider Lambda for complex aggregations
5. Use AppSync caching for static/slow-changing data
6. Monitor DynamoDB capacity and auto-scaling

## Migration Notes (Multiple Tables → Single Table)
Current design uses multiple tables for clarity. Consider Single Table Design if:
- Need to reduce query count (1 query vs N queries)
- Want ACID transactions across entities
- Optimizing for cost/latency

Benefits of current multiple-table approach:
- Easier to understand (similar to relational DB)
- Entities managed independently
- Clear schema per table
- Good for learning
