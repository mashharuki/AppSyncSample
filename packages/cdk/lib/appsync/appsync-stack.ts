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
    const customersDataSource = this.api.addDynamoDbDataSource(
      'CustomersDataSource',
      customersTable,
    );
    const productsDataSource = this.api.addDynamoDbDataSource('ProductsDataSource', productsTable);
    // Task 4.3で使用開始（Customer.ordersフィールドリゾルバー）
    const ordersDataSource = this.api.addDynamoDbDataSource('OrdersDataSource', ordersTable);
    // @ts-expect-error - 将来の注文明細リゾルバーで使用予定
    const _orderItemsDataSource = this.api.addDynamoDbDataSource(
      'OrderItemsDataSource',
      orderItemsTable,
    );

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

    // ===== 商品カタログ管理リゾルバー =====

    // Query.listProducts リゾルバー
    new Resolver(this, 'ListProductsResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'listProducts',
      dataSource: productsDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/products/listProducts.js')),
    });

    // Query.getProduct リゾルバー
    new Resolver(this, 'GetProductResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'getProduct',
      dataSource: productsDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/products/getProduct.js')),
    });

    // Mutation.createProduct リゾルバー
    new Resolver(this, 'CreateProductResolver', {
      api: this.api,
      typeName: 'Mutation',
      fieldName: 'createProduct',
      dataSource: productsDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/products/createProduct.js')),
    });

    // Query.listProductsByCategory リゾルバー
    new Resolver(this, 'ListProductsByCategoryResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'listProductsByCategory',
      dataSource: productsDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/products/listProductsByCategory.js')),
    });

    // ===== 注文管理リゾルバー =====

    // Query.listOrders リゾルバー
    new Resolver(this, 'ListOrdersResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'listOrders',
      dataSource: ordersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/orders/listOrders.js')),
    });

    // Query.listOrdersByCustomer リゾルバー
    new Resolver(this, 'ListOrdersByCustomerResolver', {
      api: this.api,
      typeName: 'Query',
      fieldName: 'listOrdersByCustomer',
      dataSource: ordersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/orders/listOrdersByCustomer.js')),
    });

    // ===== フィールドリゾルバー =====

    // Customer.orders フィールドリゾルバー
    new Resolver(this, 'CustomerOrdersFieldResolver', {
      api: this.api,
      typeName: 'Customer',
      fieldName: 'orders',
      dataSource: ordersDataSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, 'resolvers/customers/Customer.orders.js')),
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
