# プロジェクト概要

## プロジェクトの目的
AWS AppSync + DynamoDB を使用したマルチテーブルダッシュボードアプリケーションのCDKインフラストラクチャー。
GraphQL APIを通じて顧客管理、商品カタログ、注文管理、分析機能を提供する。

## 技術スタック
- **AWS CDK**: v2.150.0 (Infrastructure as Code)
- **TypeScript**: 5.3.0 (CDKスタック定義)
- **AWS AppSync**: GraphQL API (JavaScript Runtime 1.0.0)
- **DynamoDB**: NoSQLデータベース (4テーブル構成)
- **Vitest**: v1.6.1 (テストフレームワーク)
- **Node.js**: v20以降

## アーキテクチャ
### DynamoDBテーブル (4つ)
1. **Customers**: 顧客情報 (PK: customerId)
2. **Products**: 商品カタログ (PK: productId, GSI: category-gsi)
3. **Orders**: 注文情報 (PK: orderId, GSI: customer-orders-gsi)
4. **OrderItems**: 注文明細 (PK: orderItemId, GSI: order-items-gsi)

### AppSync GraphQL API
- API_KEY認証モード (学習環境用)
- CloudWatch Logs有効化
- Pipeline Resolverとフィールドリゾルバーを使用

### CDKスタック構成
- **DynamoDBStack**: 4つのDynamoDBテーブルを作成
- **AppSyncStack**: GraphQL APIとリゾルバーを作成

## プロジェクト構造
```
packages/cdk/
├── bin/
│   └── cdk.ts                          # CDKアプリのエントリーポイント
├── lib/
│   ├── dynamodb/
│   │   ├── dynamodb-stack.ts           # DynamoDBスタック定義
│   │   └── tables.ts                   # テーブル作成関数
│   └── appsync/
│       ├── appsync-stack.ts            # AppSyncスタック定義
│       ├── schema.graphql              # GraphQLスキーマ
│       └── resolvers/                  # リゾルバーコード (JavaScript)
│           ├── customers/              # 顧客管理リゾルバー
│           ├── products/               # 商品管理リゾルバー
│           ├── orders/                 # 注文管理リゾルバー
│           └── analytics/              # 分析リゾルバー
└── test/                               # テストファイル
    ├── dynamodb/                       # DynamoDB関連テスト
    ├── appsync/                        # AppSync関連テスト
    └── integration/                    # 統合テスト
```

## 主要な機能
1. **顧客管理**: 顧客の作成、取得、一覧表示、メール検索
2. **商品管理**: 商品の作成、取得、一覧表示、カテゴリ検索
3. **注文管理**: 注文の作成、取得、一覧表示、顧客別検索
4. **分析機能**: 売上サマリー、商品ランキング、顧客統計
