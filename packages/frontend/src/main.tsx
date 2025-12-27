import { Amplify } from 'aws-amplify';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import amplifyConfig from './amplifyconfiguration.json';

// Amplify v6クライアントの設定
// amplifyconfiguration.jsonから設定を読み込み、AppSync APIに接続
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: amplifyConfig.aws_appsync_graphqlEndpoint,
      region: amplifyConfig.aws_appsync_region,
      defaultAuthMode: amplifyConfig.aws_appsync_authenticationType,
      apiKey: amplifyConfig.aws_appsync_apiKey,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
