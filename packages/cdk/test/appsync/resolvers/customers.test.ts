import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { describe, expect, it } from 'vitest';
import { AppSyncStack } from '../../../lib/appsync/appsync-stack';

describe('Customer Resolvers', () => {
  /**
   * テストヘルパー: モックDynamoDBテーブルを作成
   */
  const createMockDynamoDBStack = (app: App) => {
    const { Stack } = require('aws-cdk-lib');
    const stack = new Stack(app, 'MockDynamoDBStack');

    const customersTable = new Table(stack, 'CustomersTable', {
      partitionKey: { name: 'customerId', type: AttributeType.STRING },
      sortKey: { name: 'customerId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const productsTable = new Table(stack, 'ProductsTable', {
      partitionKey: { name: 'productId', type: AttributeType.STRING },
      sortKey: { name: 'productId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const ordersTable = new Table(stack, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: AttributeType.STRING },
      sortKey: { name: 'orderId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const orderItemsTable = new Table(stack, 'OrderItemsTable', {
      partitionKey: { name: 'orderItemId', type: AttributeType.STRING },
      sortKey: { name: 'orderItemId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    return { customersTable, productsTable, ordersTable, orderItemsTable };
  };

  describe('listCustomers Resolver', () => {
    it('should create listCustomers resolver attached to Query.listCustomers', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listCustomersリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listCustomers',
      });
    });

    it('should use CustomersDataSource for listCustomers resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // CustomersDataSourceを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listCustomers',
        DataSourceName: 'CustomersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for listCustomers resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // APPSYNC_JSランタイムを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listCustomers',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('getCustomer Resolver', () => {
    it('should create getCustomer resolver attached to Query.getCustomer', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getCustomer',
      });
    });

    it('should use CustomersDataSource for getCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getCustomer',
        DataSourceName: 'CustomersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for getCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getCustomer',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('createCustomer Resolver', () => {
    it('should create createCustomer resolver attached to Mutation.createCustomer', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createCustomer',
      });
    });

    it('should use CustomersDataSource for createCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createCustomer',
        DataSourceName: 'CustomersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for createCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createCustomer',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('Resolver Count', () => {
    it('should create exactly 3 customer-related resolvers', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listCustomers、getCustomer、createCustomerの3つのリゾルバーが作成される
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const customerResolvers = Object.values(resolvers).filter((resolver: any) => {
        const fieldName = resolver.Properties.FieldName;
        return fieldName === 'listCustomers' || fieldName === 'getCustomer' || fieldName === 'createCustomer';
      });
      expect(customerResolvers.length).toBe(3);
    });
  });
});
