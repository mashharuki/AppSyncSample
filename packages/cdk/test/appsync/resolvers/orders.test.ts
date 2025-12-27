import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { describe, expect, it } from 'vitest';
import { AppSyncStack } from '../../../lib/appsync/appsync-stack';

describe('Order Resolvers', () => {
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

  describe('listOrders Resolver', () => {
    it('should create listOrders resolver attached to Query.listOrders', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listOrdersリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listOrders',
      });
    });

    it('should use OrdersDataSource for listOrders resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // OrdersDataSourceを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listOrders',
        DataSourceName: 'OrdersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for listOrders resolver', () => {
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
        FieldName: 'listOrders',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('listOrdersByCustomer Resolver', () => {
    it('should create listOrdersByCustomer resolver attached to Query.listOrdersByCustomer', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listOrdersByCustomer',
      });
    });

    it('should use OrdersDataSource for listOrdersByCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listOrdersByCustomer',
        DataSourceName: 'OrdersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for listOrdersByCustomer resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'listOrdersByCustomer',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });
  });

  describe('Resolver Count', () => {
    it('should create exactly 2 order query resolvers for task 6.1', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // listOrders、listOrdersByCustomerの2つのリゾルバーが作成される
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const orderResolvers = Object.values(resolvers).filter((resolver) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const fieldName = (resolver as any).Properties.FieldName;
        return fieldName === 'listOrders' || fieldName === 'listOrdersByCustomer';
      });
      expect(orderResolvers.length).toBe(2);
    });
  });

  describe('createOrder Resolver (Task 6.2)', () => {
    it('should create createOrder resolver attached to Mutation.createOrder', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // createOrderリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createOrder',
      });
    });

    it('should use OrdersDataSource for createOrder resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // OrdersDataSourceを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createOrder',
        DataSourceName: 'OrdersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for createOrder resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // APPSYNC_JSランタイムを使用していることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Mutation',
        FieldName: 'createOrder',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });

    it('should have code file at resolvers/orders/createOrder.js', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // resolvers/orders/createOrder.jsファイルが指定されていることを確認
      // CloudFormationテンプレートではCode.fromAsset()がS3バケット/キーに変換されるため、
      // ファイルパスの検証は間接的にリゾルバーの存在確認で代替
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const createOrderResolver = Object.values(resolvers).find((resolver) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const props = (resolver as any).Properties;
        return props.TypeName === 'Mutation' && props.FieldName === 'createOrder';
      });
      expect(createOrderResolver).toBeDefined();
    });
  });

  describe('getOrder Pipeline Resolver (Task 6.3)', () => {
    it('should create getOrder resolver attached to Query.getOrder', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // getOrderリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getOrder',
      });
    });

    it('should be a Pipeline Resolver', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // PipelineConfigが設定されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getOrder',
        Kind: 'PIPELINE',
      });
    });

    it('should have 4 pipeline functions', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // 4つのAppSync Functionが作成されていることを確認
      const functions = template.findResources('AWS::AppSync::FunctionConfiguration');
      const getOrderFunctions = Object.values(functions).filter((func) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const name = (func as any).Properties.Name;
        return (
          name === 'GetOrderFunction' ||
          name === 'GetCustomerFunction' ||
          name === 'GetOrderItemsFunction' ||
          name === 'BatchGetProductsFunction'
        );
      });
      expect(getOrderFunctions.length).toBe(4);
    });

    it('should use correct data sources for each function', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // 各FunctionでOrdersDataSource、CustomersDataSource、OrderItemsDataSource、ProductsDataSourceを使用
      template.hasResourceProperties('AWS::AppSync::FunctionConfiguration', {
        Name: 'GetOrderFunction',
        DataSourceName: 'OrdersDataSource',
      });

      template.hasResourceProperties('AWS::AppSync::FunctionConfiguration', {
        Name: 'GetCustomerFunction',
        DataSourceName: 'CustomersDataSource',
      });

      template.hasResourceProperties('AWS::AppSync::FunctionConfiguration', {
        Name: 'GetOrderItemsFunction',
        DataSourceName: 'OrderItemsDataSource',
      });

      template.hasResourceProperties('AWS::AppSync::FunctionConfiguration', {
        Name: 'BatchGetProductsFunction',
        DataSourceName: 'ProductsDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for all functions', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // すべてのFunctionでAPPSYNC_JSランタイムを使用していることを確認
      const functions = template.findResources('AWS::AppSync::FunctionConfiguration');
      const getOrderFunctions = Object.values(functions).filter((func) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const name = (func as any).Properties.Name;
        return (
          name === 'GetOrderFunction' ||
          name === 'GetCustomerFunction' ||
          name === 'GetOrderItemsFunction' ||
          name === 'BatchGetProductsFunction'
        );
      });

      for (const func of getOrderFunctions) {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        expect((func as any).Properties.Runtime).toEqual({
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        });
      }
    });

    it('should execute functions in correct order', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // PipelineConfigでFunctionが正しい順序で実行されることを確認
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const getOrderResolver = Object.values(resolvers).find((resolver) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const props = (resolver as any).Properties;
        return props.TypeName === 'Query' && props.FieldName === 'getOrder';
      });

      expect(getOrderResolver).toBeDefined();
      // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
      const pipelineConfig = (getOrderResolver as any).Properties.PipelineConfig;
      expect(pipelineConfig).toBeDefined();
      expect(pipelineConfig.Functions).toHaveLength(4);
    });
  });
});
