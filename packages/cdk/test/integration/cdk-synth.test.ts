import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CDK Synth Integration Test', () => {
  it('should generate CloudFormation template with all required resources', () => {
    // cdk.outディレクトリからCloudFormationテンプレートを読み込む
    const templatePath = join(__dirname, '../../cdk.out/AppSyncSampleDynamoDBStack.template.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

    // 4つのDynamoDBテーブルが定義されていることを確認
    const resources = template.Resources;
    const dynamoDbTables = Object.keys(resources).filter(
      (key) => resources[key].Type === 'AWS::DynamoDB::Table',
    );

    expect(dynamoDbTables).toHaveLength(4);
  });

  it('should have all GSIs with ProjectionType ALL', () => {
    const templatePath = join(__dirname, '../../cdk.out/AppSyncSampleDynamoDBStack.template.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

    const resources = template.Resources;
    const dynamoDbTables = Object.keys(resources).filter(
      (key) => resources[key].Type === 'AWS::DynamoDB::Table',
    );

    // 各テーブルのGSIがProjectionType: ALLであることを確認
    for (const tableKey of dynamoDbTables) {
      const table = resources[tableKey];
      const gsis = table.Properties.GlobalSecondaryIndexes;

      if (gsis) {
        for (const gsi of gsis) {
          expect(gsi.Projection.ProjectionType).toBe('ALL');
        }
      }
    }
  });

  it('should have DeletionPolicy Retain on all tables', () => {
    const templatePath = join(__dirname, '../../cdk.out/AppSyncSampleDynamoDBStack.template.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

    const resources = template.Resources;
    const dynamoDbTables = Object.keys(resources).filter(
      (key) => resources[key].Type === 'AWS::DynamoDB::Table',
    );

    // すべてのテーブルにDeletionPolicy: Retainが設定されていることを確認
    for (const tableKey of dynamoDbTables) {
      const table = resources[tableKey];
      expect(table.DeletionPolicy).toBe('Retain');
    }
  });

  it('should have all required DynamoDB table Outputs', () => {
    const templatePath = join(__dirname, '../../cdk.out/AppSyncSampleDynamoDBStack.template.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

    const outputs = template.Outputs;
    const outputKeys = Object.keys(outputs);

    // 少なくとも4つのOutputが存在することを確認
    expect(outputKeys.length).toBeGreaterThanOrEqual(4);

    // 各テーブル名のOutputが存在することを確認
    expect(outputs.CustomersTableName).toBeDefined();
    expect(outputs.ProductsTableName).toBeDefined();
    expect(outputs.OrdersTableName).toBeDefined();
    expect(outputs.OrderItemsTableName).toBeDefined();
  });

  it('should have BillingMode PAY_PER_REQUEST on all tables', () => {
    const templatePath = join(__dirname, '../../cdk.out/AppSyncSampleDynamoDBStack.template.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

    const resources = template.Resources;
    const dynamoDbTables = Object.keys(resources).filter(
      (key) => resources[key].Type === 'AWS::DynamoDB::Table',
    );

    // すべてのテーブルがオンデマンド課金モードであることを確認
    for (const tableKey of dynamoDbTables) {
      const table = resources[tableKey];
      expect(table.Properties.BillingMode).toBe('PAY_PER_REQUEST');
    }
  });
});
