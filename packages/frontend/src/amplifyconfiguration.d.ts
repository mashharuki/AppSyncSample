/**
 * Amplify設定ファイルの型定義
 */
export interface AmplifyConfiguration {
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: 'API_KEY' | 'AWS_IAM' | 'AMAZON_COGNITO_USER_POOLS';
  aws_appsync_apiKey?: string;
}

declare const config: AmplifyConfiguration;
export default config;
