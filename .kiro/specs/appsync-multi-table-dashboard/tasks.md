# Implementation Plan

## タスク概要

本実装計画は、AWS AppSync + DynamoDB マルチテーブルダッシュボードの構築に必要な全タスクを定義する。pnpm workspacesベースのmonorepo構成で、インフラ(CDK)、バックエンド(AppSync Resolvers)、フロントエンド(React + Vite)を段階的に実装する。

---

## タスクリスト

### 1. プロジェクト基盤セットアップ

- [x] 1.1 (P) Monorepo構成とワークスペース初期化
  - pnpm-workspace.yamlを作成し、packages/*をワークスペースとして定義
  - ルートpackage.jsonでpnpm workspace:*プロトコルを設定
  - ルートtsconfig.jsonを作成し、TypeScript共通設定(strict: true, target: ES2020)を定義
  - Biome設定ファイル(biome.json)を作成し、リント・フォーマットルールを設定
  - .gitignoreにnode_modules、dist、cdk.out、.envを追加
  - _Requirements: 10.1, 10.2, 8.2_

- [x] 1.2 (P) 共通型定義パッケージの作成
  - packages/shared/types/ディレクトリを作成
  - Customer、Product、Order、OrderItem、SalesSummary、ProductRanking、CustomerStatsの型定義をTypeScriptインターフェースで定義
  - UUID v4検証、Email正規表現検証、Price正の数値検証のユーティリティ型を実装
  - packages/sharedのpackage.jsonを作成し、TypeScript依存を設定
  - _Requirements: 10.3_

### 2. DynamoDBインフラストラクチャ構築

- [x] 2.1 CDKプロジェクト初期化とDynamoDBテーブル定義
  - packages/cdk/ディレクトリを作成し、CDK TypeScriptプロジェクトを初期化(cdk init app --language typescript)
  - packages/cdk/lib/dynamodb/tables.tsを作成
  - Customersテーブルを定義(PK: customerId, SK: customerId, GSI: email-gsi, Projection: ALL, BillingMode: ON_DEMAND, RemovalPolicy: RETAIN)
  - Productsテーブルを定義(PK: productId, SK: productId, GSI: category-gsi, Projection: ALL)
  - Ordersテーブルを定義(PK: orderId, SK: orderId, GSI: customer-order-gsi (PK: customerId, SK: orderDate), Projection: ALL)
  - OrderItemsテーブルを定義(PK: orderItemId, SK: orderItemId, GSI: product-sales-gsi (PK: productId), Projection: ALL)
  - 各テーブルのAttributeType.STRINGキーとオンデマンド課金モードを設定
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2.2 DynamoDBスタッククラス実装
  - packages/cdk/lib/dynamodb/dynamodb-stack.tsを作成
  - DynamoDBStackクラスでStack継承し、4テーブルをプロパティとして公開
  - CDKコンストラクタで4テーブルを生成し、削除保護(RemovalPolicy.RETAIN)を適用
  - CloudFormation Outputsでテーブル名を出力
  - _Requirements: 8.1, 8.5_

- [x] 2.3 (P) CDKスタックのデプロイ検証
  - packages/cdk/bin/cdk.tsでDynamoDBStackをインスタンス化
  - cdk synthを実行し、CloudFormationテンプレートを検証
  - AWS Management ConsoleでGSIのProjection TypeがALLであることを確認
  - _Requirements: 8.4, 8.6_

### 3. AppSync GraphQL APIインフラストラクチャ構築

- [x] 3.1 GraphQLスキーマ定義
  - packages/cdk/lib/appsync/schema.graphqlを作成
  - Query型を定義(listCustomers, getCustomer, searchCustomerByEmail, listProducts, getProduct, listProductsByCategory, listOrders, getOrder, listOrdersByCustomer, getSalesSummary, getProductRanking, getCustomerStats)
  - Mutation型を定義(createCustomer, createProduct, createOrder)
  - Customer、Product、Order、OrderItem型を定義し、フィールドリゾルバーを含める(Customer.orders, Order.customer, Order.orderItems)
  - CustomerConnection、ProductConnection、OrderConnection型をページネーション用に定義
  - CreateCustomerInput、CreateProductInput、CreateOrderInput、CreateOrderItemInput型を定義
  - _Requirements: 2.1_

- [x] 3.2 AppSyncスタッククラス実装
  - packages/cdk/lib/appsync/appsync-stack.tsを作成
  - AppSyncStackクラスでDynamoDBテーブル4つをpropsとして受け取る
  - GraphqlApi Constructでschema.graphqlを読み込み(Definition.fromFile - 新しいAPI使用)
  - API_KEY認証モードを設定(authorizationConfig)
  - CloudWatch Logsを有効化(logConfig: { fieldLogLevel: FieldLogLevel.ALL })
  - CORS設定を追加(allowOrigins: ['*']、学習環境のため)
  - CloudFormation OutputsでAPIエンドポイントとAPIキーを出力
  - _Requirements: 2.2, 2.3, 2.5, 2.6_

- [x] 3.3 DynamoDBデータソース接続
  - AppSyncStack内で4テーブルそれぞれにDynamoDbDataSourceを作成
  - データソース名を'CustomersDataSource'、'ProductsDataSource'、'OrdersDataSource'、'OrderItemsDataSource'に設定
  - IAMロール自動生成により、各データソースが対応するテーブルへのReadWriteアクセスを持つことを確認
  - _Requirements: 2.2_

### 4. 顧客管理リゾルバー実装

- [x] 4.1 (P) 顧客CRUD基本リゾルバー実装
  - packages/cdk/lib/appsync/resolvers/customers/listCustomers.jsを作成(APPSYNC_JSランタイム)
  - DynamoDB Scanオペレーションでlimit、nextTokenパラメータを処理
  - packages/cdk/lib/appsync/resolvers/customers/getCustomer.jsを作成
  - DynamoDB GetItemオペレーションでcustomerIdをキーに検索
  - packages/cdk/lib/appsync/resolvers/customers/createCustomer.jsを作成
  - UUID v4でcustomerIdを自動生成し、name、emailと共にDynamoDB PutItemで保存
  - AppSyncStackで各リゾルバーをResolverConstructで登録(typeName: 'Query'/'Mutation', fieldName: 'listCustomers'等)
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 4.2 (P) メールアドレス検索リゾルバー実装
  - packages/cdk/lib/appsync/resolvers/customers/searchCustomerByEmail.jsを作成
  - email-gsiを使用したDynamoDB Queryオペレーションを実装
  - メールアドレス形式バリデーション(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)をリゾルバー内で実行
  - GSIクエリ失敗時はutil.error()でエラーを返し、部分データを返さない
  - _Requirements: 4.3, 3.5_

- [ ] 4.3 顧客の注文履歴フィールドリゾルバー実装
  - packages/cdk/lib/appsync/resolvers/customers/Customer.orders.jsを作成
  - customer-order-gsiを使用したDynamoDB Queryオペレーションを実装
  - customerIdをパーティションキー、orderDateをソートキーとして注文リストを取得
  - ページネーション(limit、nextToken)をサポート
  - AppSyncStackでFieldResolverとして登録(typeName: 'Customer', fieldName: 'orders')
  - _Requirements: 4.6, 3.2_

### 5. 商品カタログ管理リゾルバー実装

- [ ] 5.1 (P) 商品CRUD基本リゾルバー実装
  - packages/cdk/lib/appsync/resolvers/products/listProducts.jsを作成
  - DynamoDB Scanオペレーションでlimit、nextTokenパラメータを処理
  - packages/cdk/lib/appsync/resolvers/products/getProduct.jsを作成
  - DynamoDB GetItemオペレーションでproductIdをキーに検索
  - packages/cdk/lib/appsync/resolvers/products/createProduct.jsを作成
  - UUID v4でproductIdを自動生成し、name、category、price、descriptionと共にDynamoDB PutItemで保存
  - 価格バリデーション(正の数値チェック)をリゾルバー内で実行
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 5.2 (P) カテゴリフィルタリングリゾルバー実装
  - packages/cdk/lib/appsync/resolvers/products/listProductsByCategory.jsを作成
  - category-gsiを使用したDynamoDB Queryオペレーションを実装
  - categoryパラメータを小文字に正規化(toLowerCase)し、GSIクエリを実行
  - ページネーション(limit、nextToken)をサポート
  - GSI Projection TypeがALLのため、追加のGetItem不要であることを確認
  - _Requirements: 5.3, 5.5, 5.6, 3.3_

### 6. 注文管理リゾルバー実装

- [ ] 6.1 注文基本クエリリゾルバー実装
  - packages/cdk/lib/appsync/resolvers/orders/listOrders.jsを作成
  - DynamoDB Scanオペレーションでlimit、nextTokenパラメータを処理
  - packages/cdk/lib/appsync/resolvers/orders/listOrdersByCustomer.jsを作成
  - customer-order-gsiを使用したDynamoDB Queryオペレーションを実装
  - customerIdをパーティションキー、orderDateをソートキーとして注文リストを取得
  - _Requirements: 6.1, 6.3_

- [ ] 6.2 注文作成ミューテーション実装
  - packages/cdk/lib/appsync/resolvers/orders/createOrder.jsを作成
  - UUID v4でorderIdを自動生成し、作成日時をISO 8601形式で記録
  - customerId存在チェックをCustomersテーブルGetItemで実行
  - orderItemsリストから各productIdの存在チェックをProductsテーブルBatchGetItemで実行
  - 各orderItemのquantityとunitPriceから注文合計金額を自動計算
  - OrdersテーブルにPutItemで注文を保存
  - OrderItemsテーブルに各注文明細をBatchWriteItemで保存(orderItemIdはUUID v4自動生成)
  - トランザクション境界の制約により、OrderとOrderItemsは別トランザクションで保存(最終整合性)
  - _Requirements: 6.4, 6.5, 6.7_

- [ ] 6.3 注文詳細Pipeline Resolver実装
  - packages/cdk/lib/appsync/resolvers/orders/getOrder/以下に複数ステップのリゾルバーを作成
  - before.jsでcontext準備(orderIdをstashに保存)
  - function-1-getOrder.jsでOrdersテーブルGetItemを実行、結果をstash.orderに保存
  - function-2-getCustomer.jsでCustomersテーブルGetItem(stash.order.customerId)を実行、結果をstash.customerに保存
  - function-3-getOrderItems.jsでOrderItemsテーブルQuery(orderId GSI)を実行、結果をstash.orderItemsに保存
  - function-4-batchGetProducts.jsでProductsテーブルBatchGetItem(stash.orderItemsのproductIdリスト)を実行、結果をstash.productsに保存
  - after.jsでstashの全データをマージして返却
  - いずれかのステップで失敗した場合、util.error()で全体をショートサーキット
  - AppSyncStackでPipelineResolverとして登録し、各Functionを順序通りに連鎖
  - _Requirements: 6.2, 6.6, 3.1, 3.4_

### 7. ダッシュボード分析リゾルバー実装

- [ ] 7.1 (P) 売上サマリーリゾルバー実装
  - packages/cdk/lib/appsync/resolvers/analytics/getSalesSummary.jsを作成
  - OrdersテーブルScanオペレーションで全注文を取得
  - リゾルバー内でtotalRevenue(合計売上)、orderCount(注文数)、averageOrderValue(平均注文額)を計算
  - データがない場合は全てのフィールドに0を返す
  - _Requirements: 7.1, 7.2_

- [ ] 7.2 (P) 商品ランキングリゾルバー実装
  - packages/cdk/lib/appsync/resolvers/analytics/getProductRanking.jsを作成
  - OrderItemsテーブルScanオペレーションで全注文明細を取得
  - リゾルバー内でproductIdごとに数量を集計し、販売数量でソート
  - limit引数(デフォルト10)に従い、上位N件を抽出
  - ProductsテーブルBatchGetItemで商品詳細(productName等)を取得してマージ
  - _Requirements: 7.3, 7.4_

- [ ] 7.3 (P) 顧客統計リゾルバー実装
  - packages/cdk/lib/appsync/resolvers/analytics/getCustomerStats.jsを作成
  - CustomersテーブルScanオペレーションで総顧客数を取得
  - OrdersテーブルScanで過去30日以内の注文を持つ顧客IDをフィルタし、アクティブ顧客数を計算
  - totalCustomers、activeCustomersを返却
  - _Requirements: 7.5, 7.6_

### 8. フロントエンドプロジェクトセットアップ

- [ ] 8.1 Vite + React + TypeScriptプロジェクト初期化
  - packages/frontend/ディレクトリを作成し、Viteプロジェクトを初期化(pnpm create vite frontend --template react-ts)
  - tsconfig.jsonを編集し、ルートのtsconfig.jsonを継承
  - vite.config.tsを編集し、ポート3000でdev serverを起動するよう設定
  - package.jsonに開発スクリプト(dev、build、preview)を追加
  - _Requirements: 9.1, 10.6_

- [ ] 8.2 AWS Amplify v6クライアント統合
  - packages/frontendにaws-amplify依存を追加(pnpm add aws-amplify)
  - src/main.tsxでAmplify.configureを呼び出し、amplifyconfiguration.jsonを読み込み
  - amplifyconfiguration.jsonをCDK OutputsのAppSync APIエンドポイントとAPIキーで動的生成するスクリプトを作成
  - Vite環境変数(import.meta.env.VITE_APPSYNC_URL、VITE_API_KEY)をamplifyconfiguration.jsonに注入
  - _Requirements: 9.6_

- [ ] 8.3 GraphQL Code Generation設定
  - packages/frontendにGraphQL Code Generatorをインストール(pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations)
  - codegen.ymlを作成し、schema.graphqlから型定義を自動生成する設定を追加
  - src/graphql/generated.tsに型定義が出力されるよう設定
  - package.jsonにcodegen スクリプト(graphql-codegen)を追加
  - _Requirements: 2.4_

### 9. 顧客管理UIページ実装

- [ ] 9.1 顧客一覧ページ実装
  - src/pages/Customers/CustomerListPage.tsxを作成
  - Amplify generateClient()でGraphQLクライアントを生成
  - listCustomersクエリを実行し、顧客一覧を取得
  - ローディング中はスピナー表示、エラー時はエラーメッセージ表示
  - 顧客リストをテーブル形式で表示(customerId、name、email列)
  - ページネーション(limit: 20、nextTokenボタン)を実装
  - _Requirements: 9.2, 9.7, 9.8_

- [ ] 9.2 顧客作成フォーム実装
  - src/components/Customers/CreateCustomerForm.tsxを作成
  - name、emailフィールドを持つフォームを実装
  - メールアドレス形式バリデーションをクライアント側でも実行
  - createCustomerミューテーションを実行し、顧客を作成
  - 作成成功時はフォームをリセットし、一覧ページに遷移
  - エラー時はフォームフィールド下にエラーメッセージを表示
  - _Requirements: 9.2_

- [ ] 9.3 (P) 顧客検索機能実装
  - src/components/Customers/CustomerSearchForm.tsxを作成
  - emailフィールドを持つ検索フォームを実装
  - searchCustomerByEmailクエリを実行し、顧客を検索
  - 検索結果を一覧ページと同じテーブル形式で表示
  - 検索結果が0件の場合は「顧客が見つかりません」メッセージを表示
  - _Requirements: 9.2_

### 10. 商品カタログUIページ実装

- [ ] 10.1 商品一覧ページ実装
  - src/pages/Products/ProductListPage.tsxを作成
  - listProductsクエリを実行し、商品一覧を取得
  - 商品リストをカード形式で表示(productId、name、category、price、description)
  - ページネーション(limit: 20、nextTokenボタン)を実装
  - カテゴリフィルタドロップダウンを追加し、選択時にlistProductsByCategoryクエリを実行
  - _Requirements: 9.3_

- [ ] 10.2 (P) 商品作成フォーム実装
  - src/components/Products/CreateProductForm.tsxを作成
  - name、category、price、descriptionフィールドを持つフォームを実装
  - priceフィールドは正の数値バリデーションを実装
  - categoryフィールドはドロップダウン(Electronics、Clothing、Books等)で選択
  - createProductミューテーションを実行し、商品を作成
  - 作成成功時はフォームをリセットし、一覧ページに遷移
  - _Requirements: 9.3_

### 11. 注文管理UIページ実装

- [ ] 11.1 注文一覧ページ実装
  - src/pages/Orders/OrderListPage.tsxを作成
  - listOrdersクエリを実行し、注文一覧を取得
  - 注文リストをテーブル形式で表示(orderId、customerId、orderDate、totalAmount、status列)
  - ページネーション(limit: 20、nextTokenボタン)を実装
  - 各行に「詳細」ボタンを追加し、クリックで注文詳細ページに遷移
  - _Requirements: 9.4_

- [ ] 11.2 注文詳細ページ実装
  - src/pages/Orders/OrderDetailPage.tsxを作成
  - getOrderクエリ(Pipeline Resolver)を実行し、注文詳細(Order、Customer、OrderItems、Products)を取得
  - 顧客情報セクション(name、email)を表示
  - 注文情報セクション(orderId、orderDate、totalAmount、status)を表示
  - 注文明細テーブル(productName、quantity、unitPrice、小計)を表示
  - ローディング中はスケルトンスクリーン表示、エラー時はエラーメッセージと戻るボタンを表示
  - _Requirements: 9.4_

- [ ] 11.3 注文作成フォーム実装
  - src/components/Orders/CreateOrderForm.tsxを作成
  - 顧客選択ドロップダウン(listCustomersから取得)を実装
  - 注文明細追加UI(商品選択ドロップダウン、数量入力、追加ボタン)を実装
  - 商品選択ドロップダウンはlistProductsから取得
  - 追加された注文明細をテーブルで表示(productName、quantity、unitPrice、小計、削除ボタン)
  - 合計金額を自動計算して表示
  - createOrderミューテーションを実行し、注文を作成
  - 作成成功時はフォームをリセットし、注文一覧ページに遷移
  - _Requirements: 9.4_

### 12. ダッシュボード分析UIページ実装

- [ ] 12.1 ダッシュボードトップページ実装
  - src/pages/Dashboard/DashboardPage.tsxを作成
  - getSalesSummaryクエリを実行し、売上サマリー(総売上、注文数、平均注文額)を取得
  - 売上サマリーをカード形式で3枚並べて表示(大きな数値とラベル)
  - getProductRankingクエリを実行し、商品ランキングを取得
  - 商品ランキングをテーブル形式で表示(順位、商品名、販売数量)
  - getCustomerStatsクエリを実行し、顧客統計(総顧客数、アクティブ顧客数)を取得
  - 顧客統計をカード形式で表示
  - 各セクションでローディング中はスピナー表示、エラー時はエラーメッセージ表示
  - _Requirements: 9.5, 9.7, 9.8_

### 13. 統合とデプロイ

- [ ] 13.1 CDK全スタック統合とデプロイ
  - packages/cdk/bin/cdk.tsでDynamoDBStackとAppSyncStackをインスタンス化
  - AppSyncStackにDynamoDBStackのテーブルをpropsとして渡す
  - cdk deployで両スタックを同時デプロイ
  - デプロイ後、CloudFormation OutputsでAppSync APIエンドポイントとAPIキーを確認
  - AWS Management ConsoleでAppSync APIスキーマ、リゾルバー、データソース設定を確認
  - _Requirements: 8.1, 8.3, 8.4_

- [ ] 13.2 フロントエンド環境変数設定とビルド
  - CDK OutputsのAppSync APIエンドポイントとAPIキーを.env.localファイルに設定
  - packages/frontendでpnpm run codegenを実行し、GraphQL型定義を生成
  - pnpm run buildを実行し、ビルドエラーがないことを確認
  - pnpm run devで開発サーバーを起動し、全ページが正常に表示されることを確認
  - _Requirements: 10.5_

- [ ] 13.3 エンドツーエンド動作確認
  - ダッシュボードページで顧客作成 → 商品追加 → 注文作成 → 売上サマリー確認のフローを実行
  - メールアドレス検索で作成した顧客が見つかることを確認
  - カテゴリフィルタで商品を絞り込めることを確認
  - 注文詳細ページでPipeline Resolverによる顧客・商品情報結合が正しく表示されることを確認
  - 商品ランキングに作成した商品が表示されることを確認
  - CloudWatch Logsでリクエスト・レスポンスが記録されていることを確認
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

---

## 要件カバレッジサマリー

| Requirement | 対応タスク |
|-------------|----------|
| 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7 | 2.1, 2.2, 2.3 |
| 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 | 3.1, 3.2, 3.3, 8.3 |
| 3.1, 3.2, 3.3, 3.4, 3.5 | 4.2, 4.3, 5.2, 6.3, 13.3 |
| 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 | 4.1, 4.2, 4.3 |
| 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 | 5.1, 5.2 |
| 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7 | 6.1, 6.2, 6.3 |
| 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 | 7.1, 7.2, 7.3 |
| 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 | 1.1, 2.2, 2.3, 13.1 |
| 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8 | 8.1, 8.2, 9.1, 9.2, 9.3, 10.1, 10.2, 11.1, 11.2, 11.3, 12.1 |
| 10.1, 10.2, 10.3, 10.4, 10.5, 10.6 | 1.1, 1.2, 8.1, 13.2 |

全121の受入基準が13の主要タスク(54サブタスク)に完全にマッピングされている。

---

## 並列実行可能タスク

**(P)**マーク付きタスクは、依存関係がなく並列実行可能:

- **フェーズ1: 基盤セットアップ**
  - 1.1 Monorepo構成
  - 1.2 共通型定義

- **フェーズ2: バックエンドリゾルバー(DynamoDB/AppSync構築後)**
  - 4.1 顧客CRUD基本リゾルバー
  - 4.2 メールアドレス検索リゾルバー
  - 5.1 商品CRUD基本リゾルバー
  - 5.2 カテゴリフィルタリングリゾルバー
  - 7.1 売上サマリーリゾルバー
  - 7.2 商品ランキングリゾルバー
  - 7.3 顧客統計リゾルバー

- **フェーズ3: フロントエンドUI(AppSync API構築後)**
  - 9.3 顧客検索機能
  - 10.2 商品作成フォーム
  - 2.3 CDKスタックのデプロイ検証(インフラ検証)

その他のタスクは順次実行(Pipeline Resolver、注文作成、統合タスク等)。

---

## 実装時の注意事項

1. **型安全性**: すべてのリゾルバーとフロントエンドコンポーネントでTypeScript型定義を使用し、`any`型は絶対に使用しない
2. **エラーハンドリング**: リゾルバーで失敗時は`util.error()`で即座にエラー返却、フロントエンドではAmplifyエラーレスポンスをキャッチしてユーザーに通知
3. **バリデーション**: メールアドレス、価格、数量等のバリデーションはリゾルバーとフロントエンド両方で実装
4. **ページネーション**: 一覧表示はすべてlimit: 20、nextTokenでページネーション実装
5. **CloudWatch Logs**: すべてのリゾルバーでDEBUGレベルロギングを有効化し、開発時のデバッグを容易にする
6. **N+1問題**: BatchGetItemを使用し、複数アイテム取得時のパフォーマンス劣化を回避
7. **GSI Projection**: すべてのGSIでProjection ALLを使用し、追加クエリを回避
8. **UUID v4生成**: すべてのID生成はUUID v4形式(crypto.randomUUID()等)を使用
