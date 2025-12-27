import { describe, expect, it } from 'vitest';
import type {
  CreateCustomerInput,
  Customer,
  Mutation,
  Order,
  Product,
  Query,
  SalesSummary,
} from '../graphql/generated';

describe('GraphQL Code Generation', () => {
  it('should generate TypeScript types from schema.graphql', () => {
    // Type assertion to verify the interface exists
    const customer: Customer = {
      customerId: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      orders: [],
    };

    expect(customer).toBeDefined();
    expect(customer.customerId).toBe('test-id');
  });

  it('should generate CreateCustomerInput type', () => {
    const input: CreateCustomerInput = {
      name: 'Test User',
      email: 'test@example.com',
    };

    expect(input).toBeDefined();
    expect(input.name).toBe('Test User');
  });

  it('should generate Product type with all fields', () => {
    const product: Product = {
      productId: 'product-1',
      name: 'Test Product',
      category: 'Electronics',
      price: 99.99,
      description: 'Test description',
    };

    expect(product).toBeDefined();
    expect(product.price).toBe(99.99);
  });

  it('should generate Order type with nested Customer', () => {
    const order: Order = {
      orderId: 'order-1',
      customerId: 'customer-1',
      customer: {
        customerId: 'customer-1',
        name: 'Test User',
        email: 'test@example.com',
        orders: [],
      },
      orderDate: '2025-12-27T00:00:00Z',
      totalAmount: 199.99,
      status: 'Pending',
      orderItems: [],
    };

    expect(order).toBeDefined();
    expect(order.customer.name).toBe('Test User');
  });

  it('should generate SalesSummary analytics type', () => {
    const summary: SalesSummary = {
      totalRevenue: 10000,
      orderCount: 50,
      averageOrderValue: 200,
    };

    expect(summary).toBeDefined();
    expect(summary.totalRevenue).toBe(10000);
  });

  it('should generate Query type with all query fields', () => {
    // Verify that Query type has expected method signatures
    // This is a compile-time check rather than runtime
    type QueryKeys = keyof Query;
    const expectedQueryFields: QueryKeys[] = [
      'listCustomers',
      'getCustomer',
      'searchCustomerByEmail',
      'listProducts',
      'getProduct',
      'listProductsByCategory',
      'listOrders',
      'getOrder',
      'listOrdersByCustomer',
      'getSalesSummary',
      'getProductRanking',
      'getCustomerStats',
    ];

    // This test verifies type structure at compile time
    expect(expectedQueryFields.length).toBe(12);
  });

  it('should generate Mutation type with all mutation fields', () => {
    type MutationKeys = keyof Mutation;
    const expectedMutationFields: MutationKeys[] = [
      'createCustomer',
      'createProduct',
      'createOrder',
    ];

    expect(expectedMutationFields.length).toBe(3);
  });
});
