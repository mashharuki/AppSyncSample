#!/usr/bin/env node
/**
 * CDK Outputsから amplifyconfiguration.json を生成するスクリプト
 * AppSync APIエンドポイントとAPIキーを読み取り、フロントエンド用の設定ファイルを生成する
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface AmplifyConfiguration {
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: string;
  aws_appsync_apiKey?: string;
}

/**
 * 環境変数からAmplify設定を生成
 * CDK deployの出力またはVite環境変数から取得
 */
function generateAmplifyConfig(): AmplifyConfiguration {
  const apiUrl = process.env.VITE_APPSYNC_URL || '';
  const apiKey = process.env.VITE_API_KEY || '';
  const region = process.env.VITE_AWS_REGION || 'ap-northeast-1';

  if (!apiUrl) {
    throw new Error('VITE_APPSYNC_URL environment variable is required');
  }

  const config: AmplifyConfiguration = {
    aws_appsync_graphqlEndpoint: apiUrl,
    aws_appsync_region: region,
    aws_appsync_authenticationType: 'API_KEY',
  };

  if (apiKey) {
    config.aws_appsync_apiKey = apiKey;
  }

  return config;
}

/**
 * amplifyconfiguration.json を生成
 */
function main(): void {
  try {
    const config = generateAmplifyConfig();
    const outputPath = join(__dirname, '../packages/frontend/src/amplifyconfiguration.json');

    writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log('✅ amplifyconfiguration.json generated successfully');
    console.log(`   Output: ${outputPath}`);
    console.log(`   Endpoint: ${config.aws_appsync_graphqlEndpoint}`);
    console.log(`   Region: ${config.aws_appsync_region}`);
  } catch (error) {
    console.error('❌ Failed to generate amplifyconfiguration.json:', error);
    process.exit(1);
  }
}

main();
