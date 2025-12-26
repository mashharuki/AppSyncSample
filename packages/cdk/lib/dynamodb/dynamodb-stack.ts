import { CfnOutput, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import type { Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import {
  createCustomersTable,
  createOrderItemsTable,
  createOrdersTable,
  createProductsTable,
} from './tables';

/**
 * DynamoDBスタック
 * 4つのテーブル(Customers, Products, Orders, OrderItems)を定義し、
 * CloudFormation Outputsでテーブル名を出力する
 */
export class DynamoDBStack extends Stack {
  public readonly customersTable: Table;
  public readonly productsTable: Table;
  public readonly ordersTable: Table;
  public readonly orderItemsTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Customersテーブルを作成
    this.customersTable = createCustomersTable(this, 'CustomersTable');

    // Productsテーブルを作成
    this.productsTable = createProductsTable(this, 'ProductsTable');

    // Ordersテーブルを作成
    this.ordersTable = createOrdersTable(this, 'OrdersTable');

    // OrderItemsテーブルを作成
    this.orderItemsTable = createOrderItemsTable(this, 'OrderItemsTable');

    // CloudFormation Outputsでテーブル名を出力
    new CfnOutput(this, 'CustomersTableName', {
      value: this.customersTable.tableName,
      description: 'Name of the Customers DynamoDB table',
      exportName: 'CustomersTableName',
    });

    new CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      description: 'Name of the Products DynamoDB table',
      exportName: 'ProductsTableName',
    });

    new CfnOutput(this, 'OrdersTableName', {
      value: this.ordersTable.tableName,
      description: 'Name of the Orders DynamoDB table',
      exportName: 'OrdersTableName',
    });

    new CfnOutput(this, 'OrderItemsTableName', {
      value: this.orderItemsTable.tableName,
      description: 'Name of the OrderItems DynamoDB table',
      exportName: 'OrderItemsTableName',
    });
  }
}
