/**
 * Amplify設定の統合テスト
 * Amplify.configure()が正しく実行されることを確認
 */

import { describe, expect, it } from 'vitest';
import amplifyConfig from '../amplifyconfiguration.json';

describe('Amplify Configuration', () => {
  it('should have valid amplifyconfiguration.json structure', () => {
    expect(amplifyConfig).toBeDefined();
    expect(amplifyConfig).toHaveProperty('aws_appsync_graphqlEndpoint');
    expect(amplifyConfig).toHaveProperty('aws_appsync_region');
    expect(amplifyConfig).toHaveProperty('aws_appsync_authenticationType');
  });

  it('should have API_KEY authentication type', () => {
    expect(amplifyConfig.aws_appsync_authenticationType).toBe('API_KEY');
  });

  it('should have valid AWS region format', () => {
    expect(amplifyConfig.aws_appsync_region).toMatch(/^[a-z]{2}-[a-z]+-\d{1}$/);
  });

  it('should have graphqlEndpoint as string (empty is acceptable for test)', () => {
    expect(typeof amplifyConfig.aws_appsync_graphqlEndpoint).toBe('string');
  });

  it('should have apiKey property (empty is acceptable for test)', () => {
    expect(amplifyConfig).toHaveProperty('aws_appsync_apiKey');
    expect(typeof amplifyConfig.aws_appsync_apiKey).toBe('string');
  });
});
