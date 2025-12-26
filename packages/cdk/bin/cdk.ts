#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { DynamoDBStack } from '../lib/dynamodb/dynamodb-stack';

const app = new App();

// DynamoDBスタックをインスタンス化
new DynamoDBStack(app, 'AppSyncSampleDynamoDBStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'DynamoDB tables for AppSync Multi-Table Dashboard',
});

app.synth();
