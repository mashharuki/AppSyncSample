import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import {
  createCustomersTable,
  createOrderItemsTable,
  createOrdersTable,
  createProductsTable,
} from '../../lib/dynamodb/tables';

describe('DynamoDB Tables', () => {
  describe('Customers Table', () => {
    it('should create Customers table with correct configuration', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      const table = createCustomersTable(stack, 'CustomersTable');

      const template = Template.fromStack(stack);

      // テーブルが作成されることを確認
      template.resourceCountIs('AWS::DynamoDB::Table', 1);

      // テーブルのプロパティを確認
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'Customers',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: 'customerId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'email',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'customerId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'customerId',
            KeyType: 'RANGE',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'email-gsi',
            KeySchema: [
              {
                AttributeName: 'email',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
      });

      // 削除保護が設定されていることを確認
      expect(table.node.defaultChild).toBeDefined();
    });
  });

  describe('Products Table', () => {
    it('should create Products table with correct configuration', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      createProductsTable(stack, 'ProductsTable');

      const template = Template.fromStack(stack);

      // テーブルが作成されることを確認
      template.resourceCountIs('AWS::DynamoDB::Table', 1);

      // テーブルのプロパティを確認
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'Products',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: 'productId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'category',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'productId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'productId',
            KeyType: 'RANGE',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'category-gsi',
            KeySchema: [
              {
                AttributeName: 'category',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
      });
    });
  });

  describe('Orders Table', () => {
    it('should create Orders table with correct configuration', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      createOrdersTable(stack, 'OrdersTable');

      const template = Template.fromStack(stack);

      // テーブルが作成されることを確認
      template.resourceCountIs('AWS::DynamoDB::Table', 1);

      // テーブルのプロパティを確認
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'Orders',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: 'orderId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'customerId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'orderDate',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'orderId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'orderId',
            KeyType: 'RANGE',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'customer-order-gsi',
            KeySchema: [
              {
                AttributeName: 'customerId',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'orderDate',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
      });
    });
  });

  describe('OrderItems Table', () => {
    it('should create OrderItems table with correct configuration', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      createOrderItemsTable(stack, 'OrderItemsTable');

      const template = Template.fromStack(stack);

      // テーブルが作成されることを確認
      template.resourceCountIs('AWS::DynamoDB::Table', 1);

      // テーブルのプロパティを確認
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'OrderItems',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: 'orderItemId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'productId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'orderId',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'orderItemId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'orderItemId',
            KeyType: 'RANGE',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'product-sales-gsi',
            KeySchema: [
              {
                AttributeName: 'productId',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
          {
            IndexName: 'order-items-gsi',
            KeySchema: [
              {
                AttributeName: 'orderId',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
      });
    });
  });
});
