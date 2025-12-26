import { join } from 'node:path';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Code,
  Definition,
  FieldLogLevel,
  FunctionRuntime,
  GraphqlApi,
  Resolver,
} from 'aws-cdk-lib/aws-appsync';
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
    const customersDataSource = this.api.addDynamoDbDataSource('CustomersDataSource', customersTable);
    // 将来のタスクで使用予定のデータソース
    // @ts-expect-error - 将来の商品・注文リゾルバーで使用予定
    const productsDataSource = this.api.addDynamoDbDataSource('ProductsDataSource', productsTable);
    // @ts-expect-error - 将来の注文リゾルバーで使用予定
    const ordersDataSource = this.api.addDynamoDbDataSource('OrdersDataSource', ordersTable);
    // @ts-expect-error - 将来の注文明細リゾルバーで使用予定
    const orderItemsDataSource = this.api.addDynamoDbDataSource('OrderItemsDataSource', orderItemsTable);

    // ===== 顧客管理リゾルバー =====

    // Query.listCustomers リゾルバー
    new Resolver(this, 'ListCustomersResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'listCustomers',
      dataSource: customersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/customers/listCustomers.js')),
    });

    // Query.getCustomer リゾルバー
    new Resolver(this, 'GetCustomerResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'getCustomer',
      dataSource: customersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/customers/getCustomer.js')),
    });

    // Mutation.createCustomer リゾルバー
    new Resolver(this, 'CreateCustomerResolver', {
      api: this.api,
      typeName: 'Mutation',
      fieldName: 'createCustomer',
      dataSource: customersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/customers/createCustomer.js')),
    });

    // Query.searchCustomerByEmail リゾルバー
    new Resolver(this, 'SearchCustomerByEmailResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'searchCustomerByEmail',
      dataSource: customersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/customers/searchCustomerByEmail.js')),
    });

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
