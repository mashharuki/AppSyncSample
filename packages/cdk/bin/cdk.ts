#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { DynamoDBStack } from '../lib/dynamodb/dynamodb-stack';
import { AppSyncStack } from '../lib/appsync/appsync-stack';

const app = new App();

// DynamoDBスタックをインスタンス化
const dynamoDbStack = new DynamoDBStack(app, 'AppSyncSampleDynamoDBStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'DynamoDB tables for AppSync Multi-Table Dashboard',
});

// AppSyncスタックをインスタンス化（DynamoDBテーブルをpropsとして渡す）
new AppSyncStack(app, 'AppSyncSampleAppSyncStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'AppSync GraphQL API for Multi-Table Dashboard',
  customersTable: dynamoDbStack.customersTable,
  productsTable: dynamoDbStack.productsTable,
  ordersTable: dynamoDbStack.ordersTable,
  orderItemsTable: dynamoDbStack.orderItemsTable,
});

app.synth();
