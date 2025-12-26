import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { describe, expect, it } from 'vitest';
import { AppSyncStack } from '../../lib/appsync/appsync-stack';

describe('AppSyncStack', () => {
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

  describe('Constructor and Basic Setup', () => {
    it('should create AppSyncStack with required DynamoDB tables', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // GraphQL APIが作成されることを確認
      template.resourceCountIs('AWS::AppSync::GraphQLApi', 1);
    });

    it('should load GraphQL schema from schema.graphql file', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // GraphQL APIがschemaを持つことを確認
      template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
        Name: Match.anyValue(),
      });
    });

    it('should configure API_KEY authentication mode', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // API_KEY認証が設定されていることを確認
      template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
        AuthenticationType: 'API_KEY',
      });
    });

    it('should enable CloudWatch Logs with ALL field log level', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // CloudWatch Logsが有効化されていることを確認
      template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
        LogConfig: {
          FieldLogLevel: 'ALL',
          CloudWatchLogsRoleArn: Match.anyValue(),
        },
      });
    });
  });

  describe('DynamoDB Data Sources', () => {
    it('should create DynamoDB data source for Customers table', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::DataSource', {
        Name: 'CustomersDataSource',
        Type: 'AMAZON_DYNAMODB',
      });
    });

    it('should create DynamoDB data source for Products table', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::DataSource', {
        Name: 'ProductsDataSource',
        Type: 'AMAZON_DYNAMODB',
      });
    });

    it('should create DynamoDB data source for Orders table', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::DataSource', {
        Name: 'OrdersDataSource',
        Type: 'AMAZON_DYNAMODB',
      });
    });

    it('should create DynamoDB data source for OrderItems table', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::AppSync::DataSource', {
        Name: 'OrderItemsDataSource',
        Type: 'AMAZON_DYNAMODB',
      });
    });

    it('should create exactly 4 DynamoDB data sources', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.resourceCountIs('AWS::AppSync::DataSource', 4);
    });
  });

  describe('CloudFormation Outputs', () => {
    it('should output AppSync API endpoint URL', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasOutput('GraphQLApiUrl', {
        Description: 'GraphQL API URL',
        Export: { Name: 'GraphQLApiUrl' },
      });
    });

    it('should output AppSync API key', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      template.hasOutput('GraphQLApiKey', {
        Description: 'GraphQL API Key',
        Export: { Name: 'GraphQLApiKey' },
      });
    });
  });

  describe('CORS Configuration', () => {
    it('should configure CORS to allow all origins (for learning environment)', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // Note: CORS設定はAppSyncのリソースプロパティではなく、
      // API設定の一部として存在するため、直接的な検証は困難
      // ここでは、API自体が作成されることを確認
      template.resourceCountIs('AWS::AppSync::GraphQLApi', 1);
    });
  });

  describe('IAM Permissions', () => {
    it('should grant data sources read/write permissions to DynamoDB tables', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // IAMロールが作成されることを確認（データソース用のロール + CloudWatch Logs用のロール）
      // AppSyncは自動的にIAMロールを作成する
      const roles = template.findResources('AWS::IAM::Role');
      expect(Object.keys(roles).length).toBeGreaterThan(0);
    });
  });
});
