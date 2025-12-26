# Requirements Document

## Introduction
本プロジェクトは、AWS AppSyncとDynamoDBを組み合わせて、複数のテーブルにまたがるデータを効率的にクエリできるGraphQL APIを構築し、そのAPIを活用したECサイトダッシュボードを開発することを目的とする。DynamoDBはSQLジョインをサポートしていないため、AppSyncのパイプラインリゾルバーとフィールドリゾルバーを活用してマルチテーブルデータ集約を実現する。

## Requirements

### Requirement 1: DynamoDBテーブル設計
**Objective:** As a システムアーキテクト, I want 正規化されたDynamoDBテーブル構造を定義する, so that ECサイトのデータを効率的に保存・クエリできる

#### Acceptance Criteria
1. The DynamoDBインフラストラクチャ shall 4つの主要テーブル（Customers、Products、Orders、OrderItems）を定義する
2. The Customersテーブル shall PK（customerId）とSK（customerId）をキーとし、emailフィールドにGSIを持つ
3. The Productsテーブル shall PK（productId）とSK（productId）をキーとし、categoryフィールドにGSIを持つ
4. The Ordersテーブル shall PK（orderId）とSK（orderId）をキーとし、customerIdとorderDateにGSIを持つ
5. The OrderItemsテーブル shall PK（orderItemId）とSK（orderItemId）をキーとし、productIdにGSIを持つ
6. The DynamoDBテーブル shall オンデマンド課金モードまたはプロビジョニング済みキャパシティで構成可能である
7. The DynamoDBテーブル shall 削除保護を有効化し、本番環境での誤削除を防ぐ

### Requirement 2: AppSync GraphQL API基盤
**Objective:** As a バックエンド開発者, I want AppSync GraphQL APIを構築する, so that フロントエンドアプリケーションがデータにアクセスできる

#### Acceptance Criteria
1. The AppSync API shall GraphQLスキーマを定義し、Customer、Product、Order、OrderItem型を含む
2. The AppSync API shall DynamoDBデータソースを各テーブルに対して設定する
3. The AppSync API shall API_KEY認証方式をサポートする（開発・学習目的）
4. When GraphQLスキーマが更新された場合, the AppSync API shall 自動的に型定義を再生成する
5. The AppSync API shall CORSを設定し、フロントエンドアプリケーションからのリクエストを許可する
6. The AppSync API shall CloudWatch Logsを有効化し、リクエスト・レスポンスをロギングする

### Requirement 3: マルチテーブルデータ結合機能
**Objective:** As a GraphQL API利用者, I want 複数テーブルのデータを1つのクエリで取得できる, so that アプリケーションのパフォーマンスが向上する

#### Acceptance Criteria
1. When 注文詳細がリクエストされた場合, the AppSync Resolver shall パイプラインリゾルバーを使用してOrder、Customer、OrderItems、Product情報を結合する
2. When 顧客情報がリクエストされた場合, the AppSync Resolver shall フィールドリゾルバーを使用して関連する注文リストを遅延読み込みする
3. When 商品情報がリクエストされた場合, the AppSync Resolver shall カテゴリGSIを使用してカテゴリフィルタリングをサポートする
4. When 複数の注文アイテムが同時にリクエストされた場合, the AppSync Resolver shall バッチリゾルバーを使用してN+1クエリ問題を回避する
5. If GSIクエリが失敗した場合, then the AppSync Resolver shall エラーメッセージを返し、部分的なデータを返さない

### Requirement 4: 顧客管理機能
**Objective:** As a ダッシュボード利用者, I want 顧客情報を管理できる, so that 顧客データを追跡・検索できる

#### Acceptance Criteria
1. The GraphQL API shall 顧客一覧を取得するクエリ（listCustomers）を提供する
2. The GraphQL API shall 顧客IDで顧客を取得するクエリ（getCustomer）を提供する
3. The GraphQL API shall メールアドレスで顧客を検索するクエリ（searchCustomerByEmail）を提供する
4. The GraphQL API shall 新規顧客を作成するミューテーション（createCustomer）を提供する
5. When 顧客が作成された場合, the GraphQL API shall 顧客IDを自動生成する（UUID v4形式）
6. When 顧客詳細がリクエストされた場合, the GraphQL API shall 顧客の注文履歴を含める

### Requirement 5: 商品カタログ管理機能
**Objective:** As a ダッシュボード利用者, I want 商品カタログを管理できる, so that 商品情報を追加・検索できる

#### Acceptance Criteria
1. The GraphQL API shall 商品一覧を取得するクエリ（listProducts）を提供する
2. The GraphQL API shall 商品IDで商品を取得するクエリ（getProduct）を提供する
3. The GraphQL API shall カテゴリで商品をフィルタリングするクエリ（listProductsByCategory）を提供する
4. The GraphQL API shall 新規商品を作成するミューテーション（createProduct）を提供する
5. When 商品一覧がリクエストされた場合, the GraphQL API shall ページネーション（limit、nextToken）をサポートする
6. When カテゴリフィルタが適用された場合, the GraphQL API shall カテゴリGSIを使用してクエリを実行する

### Requirement 6: 注文管理機能
**Objective:** As a ダッシュボード利用者, I want 注文情報を管理できる, so that 注文の詳細を追跡できる

#### Acceptance Criteria
1. The GraphQL API shall 注文一覧を取得するクエリ（listOrders）を提供する
2. The GraphQL API shall 注文IDで注文を取得するクエリ（getOrder）を提供する
3. The GraphQL API shall 顧客IDで注文を検索するクエリ（listOrdersByCustomer）を提供する
4. The GraphQL API shall 新規注文を作成するミューテーション（createOrder）を提供する
5. When 注文が作成された場合, the GraphQL API shall 注文IDを自動生成し、作成日時を記録する
6. When 注文詳細がリクエストされた場合, the GraphQL API shall 注文アイテム、商品情報、顧客情報を含める
7. When 注文アイテムが追加された場合, the GraphQL API shall 注文合計金額を自動計算する

### Requirement 7: ダッシュボード分析機能
**Objective:** As a ビジネス分析者, I want ダッシュボードで売上と顧客の統計を確認できる, so that ビジネスインサイトを得られる

#### Acceptance Criteria
1. The GraphQL API shall 売上サマリーを取得するクエリ（getSalesSummary）を提供する
2. When 売上サマリーがリクエストされた場合, the GraphQL API shall 総売上、注文数、平均注文額を計算する
3. The GraphQL API shall 商品ランキングを取得するクエリ（getProductRanking）を提供する
4. When 商品ランキングがリクエストされた場合, the GraphQL API shall 販売数量でソートされた商品リストを返す
5. The GraphQL API shall 顧客統計を取得するクエリ（getCustomerStats）を提供する
6. When 顧客統計がリクエストされた場合, the GraphQL API shall 総顧客数、アクティブ顧客数を返す

### Requirement 8: インフラストラクチャ管理（CDK）
**Objective:** As a DevOpsエンジニア, I want Infrastructure as Codeでリソースを管理する, so that 環境の再現性と保守性を確保できる

#### Acceptance Criteria
1. The CDKスタック shall DynamoDBテーブル、AppSync API、S3バケットを定義する
2. The CDKスタック shall pnpm workspacesを使用したmonorepo構成をサポートする
3. The CDKスタック shall 環境変数（dev、staging、prod）による環境分離をサポートする
4. When CDKスタックがデプロイされた場合, the CDKスタック shall AppSync APIエンドポイントとAPIキーを出力する
5. When CDKスタックが削除された場合, the CDKスタック shall DynamoDBテーブルの削除保護設定に従う
6. The CDKスタック shall CloudWatch Logsロググループを作成し、保持期間を設定する

### Requirement 9: フロントエンドダッシュボード
**Objective:** As a ダッシュボードユーザー, I want Webブラウザでダッシュボードにアクセスできる, so that データを視覚的に確認できる

#### Acceptance Criteria
1. The フロントエンドアプリケーション shall React + TypeScript + Viteで構築される
2. The フロントエンドアプリケーション shall 顧客管理ページを提供する
3. The フロントエンドアプリケーション shall 商品カタログページを提供する
4. The フロントエンドアプリケーション shall 注文管理ページを提供する
5. The フロントエンドアプリケーション shall ダッシュボード分析ページを提供する
6. When AppSync APIにリクエストする場合, the フロントエンドアプリケーション shall GraphQLクライアントライブラリを使用する
7. When データ取得中の場合, the フロントエンドアプリケーション shall ローディングインジケーターを表示する
8. If API呼び出しが失敗した場合, then the フロントエンドアプリケーション shall エラーメッセージをユーザーに表示する

### Requirement 10: 開発環境とツール
**Objective:** As a 開発者, I want 効率的な開発ツールチェーンを使用する, so that 開発生産性が向上する

#### Acceptance Criteria
1. The プロジェクト shall pnpmをパッケージマネージャーとして使用する
2. The プロジェクト shall Biomeをリンター・フォーマッターとして使用する
3. The プロジェクト shall TypeScriptによる型安全性を確保する
4. When コードがコミットされる場合, the プロジェクト shall Biomeによる自動フォーマットを実行する
5. When ビルドが実行される場合, the プロジェクト shall TypeScriptの型チェックを実行する
6. The プロジェクト shall ローカル開発環境でのホットリロードをサポートする

