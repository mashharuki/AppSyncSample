import { describe, it, expect } from 'vitest';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DynamoDBStack } from '../../lib/dynamodb/dynamodb-stack';

describe('DynamoDBStack', () => {
  it('should create all 4 DynamoDB tables', () => {
    const app = new App();
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');

    const template = Template.fromStack(stack);

    // 4つのテーブルが作成されることを確認
    template.resourceCountIs('AWS::DynamoDB::Table', 4);
  });

  it('should expose tables as public properties', () => {
    const app = new App();
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');

    // テーブルがプロパティとして公開されていることを確認
    expect(stack.customersTable).toBeDefined();
    expect(stack.productsTable).toBeDefined();
    expect(stack.ordersTable).toBeDefined();
    expect(stack.orderItemsTable).toBeDefined();
  });

  it('should output table names as CloudFormation Outputs', () => {
    const app = new App();
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');

    const template = Template.fromStack(stack);

    // CloudFormation Outputsが作成されることを確認(4つ)
    const outputs = template.toJSON().Outputs;
    expect(Object.keys(outputs)).toHaveLength(4);

    // 各テーブル名のOutputが存在することを確認
    expect(outputs.CustomersTableName).toBeDefined();
    expect(outputs.ProductsTableName).toBeDefined();
    expect(outputs.OrdersTableName).toBeDefined();
    expect(outputs.OrderItemsTableName).toBeDefined();

    // Outputの説明が正しいことを確認
    expect(outputs.CustomersTableName.Description).toBe('Name of the Customers DynamoDB table');
    expect(outputs.ProductsTableName.Description).toBe('Name of the Products DynamoDB table');
    expect(outputs.OrdersTableName.Description).toBe('Name of the Orders DynamoDB table');
    expect(outputs.OrderItemsTableName.Description).toBe('Name of the OrderItems DynamoDB table');
  });

  it('should have RemovalPolicy RETAIN on all tables', () => {
    const app = new App();
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');

    const template = Template.fromStack(stack);

    // すべてのテーブルにDeletionPolicy: Retainが設定されていることを確認
    const tables = template.findResources('AWS::DynamoDB::Table');
    const tableKeys = Object.keys(tables);

    expect(tableKeys).toHaveLength(4);

    for (const tableKey of tableKeys) {
      expect(tables[tableKey].DeletionPolicy).toBe('Retain');
    }
  });
});
