import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type GraphQLSchema, buildSchema } from 'graphql';
import { describe, expect, it } from 'vitest';

describe('GraphQL Schema Validation', () => {
  let schema: GraphQLSchema;

  it('should load and parse schema.graphql successfully', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');

    expect(() => {
      schema = buildSchema(schemaString);
    }).not.toThrow();

    expect(schema).toBeDefined();
  });

  it('should define Query type with required operations', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const queryType = schema.getQueryType();
    expect(queryType).toBeDefined();

    const queryFields = queryType?.getFields();
    expect(queryFields).toBeDefined();

    // 顧客管理クエリ
    expect(queryFields?.listCustomers).toBeDefined();
    expect(queryFields?.getCustomer).toBeDefined();
    expect(queryFields?.searchCustomerByEmail).toBeDefined();

    // 商品カタログクエリ
    expect(queryFields?.listProducts).toBeDefined();
    expect(queryFields?.getProduct).toBeDefined();
    expect(queryFields?.listProductsByCategory).toBeDefined();

    // 注文管理クエリ
    expect(queryFields?.listOrders).toBeDefined();
    expect(queryFields?.getOrder).toBeDefined();
    expect(queryFields?.listOrdersByCustomer).toBeDefined();

    // ダッシュボード分析クエリ
    expect(queryFields?.getSalesSummary).toBeDefined();
    expect(queryFields?.getProductRanking).toBeDefined();
    expect(queryFields?.getCustomerStats).toBeDefined();
  });

  it('should define Mutation type with required operations', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const mutationType = schema.getMutationType();
    expect(mutationType).toBeDefined();

    const mutationFields = mutationType?.getFields();
    expect(mutationFields).toBeDefined();

    expect(mutationFields?.createCustomer).toBeDefined();
    expect(mutationFields?.createProduct).toBeDefined();
    expect(mutationFields?.createOrder).toBeDefined();
  });

  it('should define Customer type with required fields', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const customerType = schema.getType('Customer');
    expect(customerType).toBeDefined();

    if (customerType && 'getFields' in customerType) {
      const fields = customerType.getFields();
      expect(fields.customerId).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.orders).toBeDefined(); // Field Resolver
    }
  });

  it('should define Product type with required fields', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const productType = schema.getType('Product');
    expect(productType).toBeDefined();

    if (productType && 'getFields' in productType) {
      const fields = productType.getFields();
      expect(fields.productId).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.category).toBeDefined();
      expect(fields.price).toBeDefined();
      expect(fields.description).toBeDefined();
    }
  });

  it('should define Order type with required fields and relationships', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const orderType = schema.getType('Order');
    expect(orderType).toBeDefined();

    if (orderType && 'getFields' in orderType) {
      const fields = orderType.getFields();
      expect(fields.orderId).toBeDefined();
      expect(fields.customerId).toBeDefined();
      expect(fields.customer).toBeDefined(); // Field/Pipeline Resolver
      expect(fields.orderDate).toBeDefined();
      expect(fields.totalAmount).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.orderItems).toBeDefined(); // Batch Resolver
    }
  });

  it('should define OrderItem type with required fields', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    const orderItemType = schema.getType('OrderItem');
    expect(orderItemType).toBeDefined();

    if (orderItemType && 'getFields' in orderItemType) {
      const fields = orderItemType.getFields();
      expect(fields.orderItemId).toBeDefined();
      expect(fields.orderId).toBeDefined();
      expect(fields.productId).toBeDefined();
      expect(fields.quantity).toBeDefined();
      expect(fields.unitPrice).toBeDefined();
      expect(fields.product).toBeDefined(); // Field Resolver
    }
  });

  it('should define Connection types for pagination', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    expect(schema.getType('CustomerConnection')).toBeDefined();
    expect(schema.getType('ProductConnection')).toBeDefined();
    expect(schema.getType('OrderConnection')).toBeDefined();
  });

  it('should define Input types for mutations', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    expect(schema.getType('CreateCustomerInput')).toBeDefined();
    expect(schema.getType('CreateProductInput')).toBeDefined();
    expect(schema.getType('CreateOrderInput')).toBeDefined();
    expect(schema.getType('CreateOrderItemInput')).toBeDefined();
  });

  it('should define Analytics types', () => {
    const schemaPath = join(__dirname, '../../lib/appsync/schema.graphql');
    const schemaString = readFileSync(schemaPath, 'utf-8');
    schema = buildSchema(schemaString);

    expect(schema.getType('SalesSummary')).toBeDefined();
    expect(schema.getType('ProductRanking')).toBeDefined();
    expect(schema.getType('CustomerStats')).toBeDefined();
  });
});
