import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';

/**
 * Customersテーブルを作成
 * - PK: customerId, SK: customerId
 * - GSI: email-gsi (PK: email)
 */
export function createCustomersTable(scope: Construct, id: string): Table {
  const table = new Table(scope, id, {
    tableName: 'Customers',
    partitionKey: {
      name: 'customerId',
      type: AttributeType.STRING,
    },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.RETAIN,
  });

  // Email GSI
  table.addGlobalSecondaryIndex({
    indexName: 'email-gsi',
    partitionKey: {
      name: 'email',
      type: AttributeType.STRING,
    },
    projectionType: ProjectionType.ALL,
  });

  return table;
}

/**
 * Productsテーブルを作成
 * - PK: productId, SK: productId
 * - GSI: category-gsi (PK: category)
 */
export function createProductsTable(scope: Construct, id: string): Table {
  const table = new Table(scope, id, {
    tableName: 'Products',
    partitionKey: {
      name: 'productId',
      type: AttributeType.STRING,
    },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.RETAIN,
  });

  // Category GSI
  table.addGlobalSecondaryIndex({
    indexName: 'category-gsi',
    partitionKey: {
      name: 'category',
      type: AttributeType.STRING,
    },
    projectionType: ProjectionType.ALL,
  });

  return table;
}

/**
 * Ordersテーブルを作成
 * - PK: orderId, SK: orderId
 * - GSI: customer-order-gsi (PK: customerId, SK: orderDate)
 */
export function createOrdersTable(scope: Construct, id: string): Table {
  const table = new Table(scope, id, {
    tableName: 'Orders',
    partitionKey: {
      name: 'orderId',
      type: AttributeType.STRING,
    },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.RETAIN,
  });

  // Customer Order GSI
  table.addGlobalSecondaryIndex({
    indexName: 'customer-order-gsi',
    partitionKey: {
      name: 'customerId',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'orderDate',
      type: AttributeType.STRING,
    },
    projectionType: ProjectionType.ALL,
  });

  return table;
}

/**
 * OrderItemsテーブルを作成
 * - PK: orderItemId, SK: orderItemId
 * - GSI: product-sales-gsi (PK: productId)
 */
export function createOrderItemsTable(scope: Construct, id: string): Table {
  const table = new Table(scope, id, {
    tableName: 'OrderItems',
    partitionKey: {
      name: 'orderItemId',
      type: AttributeType.STRING,
    },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.RETAIN,
  });

  // Product Sales GSI
  table.addGlobalSecondaryIndex({
    indexName: 'product-sales-gsi',
    partitionKey: {
      name: 'productId',
      type: AttributeType.STRING,
    },
    projectionType: ProjectionType.ALL,
  });

  // Order Items GSI (for querying by orderId)
  table.addGlobalSecondaryIndex({
    indexName: 'order-items-gsi',
    partitionKey: {
      name: 'orderId',
      type: AttributeType.STRING,
    },
    projectionType: ProjectionType.ALL,
  });

  return table;
}
