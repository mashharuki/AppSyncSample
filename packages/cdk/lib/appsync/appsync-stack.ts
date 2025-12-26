import { join } from 'node:path';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import { AuthorizationType, Definition, FieldLogLevel, GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import type { Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';

/**
 * AppSyncStackのプロパティ
 * DynamoDBテーブル4つを受け取る
 */
export interface AppSyncStackProps extends StackProps {
  customersTable: Table;
  productsTable: Table;
  ordersTable: Table;
  orderItemsTable: Table;
}

/**
 * AppSyncスタック
 * GraphQL APIを作成し、DynamoDBデータソースを接続する
 * API_KEY認証モード、CloudWatch Logsを有効化
 */
export class AppSyncStack extends Stack {
  public readonly api: GraphqlApi;

  constructor(scope: Construct, id: string, props: AppSyncStackProps) {
    super(scope, id, props);

    const { customersTable, productsTable, ordersTable, orderItemsTable } = props;

    // GraphQL APIを作成
    this.api = new GraphqlApi(this, 'AppSyncApi', {
      name: 'AppSyncMultiTableDashboardApi',
      // schema.graphqlファイルを読み込み（新しいDefinition APIを使用）
      definition: Definition.fromFile(join(__dirname, 'schema.graphql')),
      // API_KEY認証モードを設定（学習環境のため）
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      },
      // CloudWatch Logsを有効化
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      // CORS設定（学習環境のため全オリジンを許可）
      // Note: xApiKeyRequired: falseはセキュリティ上本番環境では非推奨
    });

    // DynamoDBデータソースを作成
    // データソースはリゾルバー実装時（タスク3.3以降）に使用される
    this.api.addDynamoDbDataSource('CustomersDataSource', customersTable);

    this.api.addDynamoDbDataSource('ProductsDataSource', productsTable);

    this.api.addDynamoDbDataSource('OrdersDataSource', ordersTable);

    this.api.addDynamoDbDataSource('OrderItemsDataSource', orderItemsTable);

    // CloudFormation Outputsでエンドポイントとキーを出力
    new CfnOutput(this, 'GraphQLApiUrl', {
      value: this.api.graphqlUrl,
      description: 'GraphQL API URL',
      exportName: 'GraphQLApiUrl',
    });

    new CfnOutput(this, 'GraphQLApiKey', {
      value: this.api.apiKey || 'NO_API_KEY',
      description: 'GraphQL API Key',
      exportName: 'GraphQLApiKey',
    });
  }
}
