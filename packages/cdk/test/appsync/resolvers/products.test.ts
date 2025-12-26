import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { describe, expect, it } from 'vitest';
import { AppSyncStack } from '../../../lib/appsync/appsync-stack';

describe('Product Resolvers', () => {
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

  describe('listProducts Resolver', () => {
    it('should create listProducts resolver attached to Query.listProducts', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listProductsリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listProducts',
      });
    });

    it('should use ProductsDataSource for listProducts resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // ProductsDataSourceを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listProducts',
        DataSourceName: 'ProductsDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for listProducts resolver', () => {
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
        FieldName: 'listProducts',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('getProduct Resolver', () => {
    it('should create getProduct resolver attached to Query.getProduct', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getProduct',
      });
    });

    it('should use ProductsDataSource for getProduct resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getProduct',
        DataSourceName: 'ProductsDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for getProduct resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getProduct',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('createProduct Resolver', () => {
    it('should create createProduct resolver attached to Mutation.createProduct', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createProduct',
      });
    });

    it('should use ProductsDataSource for createProduct resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createProduct',
        DataSourceName: 'ProductsDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for createProduct resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createProduct',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('Resolver Count', () => {
    it('should create exactly 3 product-related resolvers', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listProducts、getProduct、createProductの3つのリゾルバーが作成される
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const productResolvers = Object.values(resolvers).filter((resolver) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const fieldName = (resolver as any).Properties.FieldName;
        return (
          fieldName === 'listProducts' ||
          fieldName === 'getProduct' ||
          fieldName === 'createProduct'
        );
      });
      expect(productResolvers.length).toBe(3);
    });
  });
});
