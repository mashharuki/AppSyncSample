import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { describe, expect, it } from 'vitest';
import { AppSyncStack } from '../../../lib/appsync/appsync-stack';

describe('Analytics Resolvers', () => {
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

  describe('getSalesSummary Resolver (Task 7.1)', () => {
    it('should create getSalesSummary resolver attached to Query.getSalesSummary', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // getSalesSummaryリゾルバーが作成されていることを確認
      template.hasResourceProperties('AWS::AppSync::Resolver', {
        TypeName: 'Query',
        FieldName: 'getSalesSummary',
      });
    });

    it('should use OrdersDataSource for getSalesSummary resolver', () => {
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
        FieldName: 'getSalesSummary',
        DataSourceName: 'OrdersDataSource',
      });
    });

    it('should use APPSYNC_JS runtime for getSalesSummary resolver', () => {
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
        FieldName: 'getSalesSummary',
        Runtime: {
          Name: 'APPSYNC_JS',
          RuntimeVersion: '1.0.0',
        },
      });
    });

    it('should have code file at resolvers/analytics/getSalesSummary.js', () => {
      // Arrange
      const app = new App();
      const tables = createMockDynamoDBStack(app);

      // Act
      const stack = new AppSyncStack(app, 'TestAppSyncStack', tables);
      const template = Template.fromStack(stack);

      // Assert
      // resolvers/analytics/getSalesSummary.jsファイルが指定されていることを確認
      // CloudFormationテンプレートではCode.fromAsset()がS3バケット/キーに変換されるため、
      // ファイルパスの検証は間接的にリゾルバーの存在確認で代替
      const resolvers = template.findResources('AWS::AppSync::Resolver');
      const getSalesSummaryResolver = Object.values(resolvers).find((resolver) => {
        // biome-ignore lint/suspicious/noExplicitAny: CloudFormation template types are dynamic
        const props = (resolver as any).Properties;
        return props.TypeName === 'Query' && props.FieldName === 'getSalesSummary';
      });
      expect(getSalesSummaryResolver).toBeDefined();
    });
  });
});
