# Research & Design Decisions

---
**Purpose**: AppSync + DynamoDB マルチテーブルダッシュボード機能の設計判断と調査結果を記録する。

**Usage**:
- ディスカバリーフェーズで得られた技術調査の成果を記録
- 設計判断のトレードオフを詳細に文書化
- 将来の監査や再利用のための参考資料を提供
---

## Summary
- **Feature**: `appsync-multi-table-dashboard`
- **Discovery Scope**: New Feature (グリーンフィールドプロジェクト)
- **Key Findings**:
  - AppSync Pipeline Resolversを使用したマルチテーブル結合パターンが確立されている
  - DynamoDB GSIの新機能(マルチ属性コンポジットキー)により、合成キーが不要になった
  - AWS Amplify v6が公式推奨のGraphQLクライアントライブラリとなっている
  - APPSYNC_JSランタイムがVTLよりも優先される最新の推奨事項

## Research Log

### AppSync Pipeline Resolversによるマルチテーブルデータ集約

- **Context**: DynamoDBはSQLジョインをサポートしないため、複数テーブルにまたがるデータ取得方法を調査
- **Sources Consulted**:
  - [AWS AppSync Pipeline Resolvers - Part 2: Data Aggregation](https://aws.amazon.com/blogs/mobile/appsync-pipeline-resolvers-2/)
  - [Using pipeline resolvers in AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-pipeline-resolvers.html)
  - [Single-table vs multi-table DynamoDB design patterns](https://aws.amazon.com/blogs/mobile/single-table-vs-multi-table-dynamodb-appsync/)
- **Findings**:
  - Pipeline Resolversは複数のデータソースを順次実行し、結果を連鎖させる
  - Before/After Mapping Templatesで前処理・後処理を実装可能
  - 各Function StepはVTLまたはJavaScriptで記述可能
  - `$ctx.prev.result`で前のステップの結果にアクセス
  - 早期リターン(`#return()`)でパフォーマンス最適化が可能
- **Implications**:
  - Order詳細取得時に、Order → Customer → OrderItems → Productsの順で連鎖的にデータを取得するパイプラインを設計
  - 認可ロジック(例: 顧客-注文の関連チェック)をパイプラインの最初のステップに配置し、不正アクセスを早期に遮断

### DynamoDB GSI設計パターン

- **Context**: ECサイトのアクセスパターン(顧客別注文検索、カテゴリ別商品検索)を効率的に実装する方法を調査
- **Sources Consulted**:
  - [DynamoDB Database Design in 2025](https://newsletter.simpleaws.dev/p/dynamodb-database-design-in-2025)
  - [Global Secondary Indexes (GSI) in DynamoDB: Complete Guide (2025)](https://dynomate.io/blog/dynamodb-gsi/)
  - [Using DynamoDB as a data store for an online shop](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/data-modeling-online-shop.html)
  - [Multi-key support for Global Secondary Index](https://aws.amazon.com/blogs/database/multi-key-support-for-global-secondary-index-in-amazon-dynamodb/)
- **Findings**:
  - **2025年新機能**: GSIでマルチ属性コンポジットキー(最大4パーティションキー属性 + 4ソートキー属性)がサポートされ、合成キーが不要に
  - Projection Types: `KEYS_ONLY` < `INCLUDE` < `ALL` の順でストレージコストが増加
  - GSI書き込みキャパシティは基底テーブルと同等以上が必要(スロットリング回避のため)
  - GSIクエリは結果整合性(Eventually Consistent)のため、RCUコストは0.5倍
  - Sparse Indexesパターン: GSI属性を持つアイテムのみインデックス化される
- **Implications**:
  - Customersテーブル: `email`にGSI作成(メールアドレス検索用)
  - Productsテーブル: `category`にGSI作成(カテゴリフィルタリング用)
  - Ordersテーブル: `customerId`と`orderDate`にGSI作成(顧客別・日付範囲検索用)
  - OrderItemsテーブル: `productId`にGSI作成(商品別販売数集計用)
  - Projection Typeは`ALL`を採用し、追加のテーブルクエリを回避してレイテンシを最小化

### N+1クエリ問題とバッチリゾルバー

- **Context**: GraphQLのネストされたフィールドリゾルバーによるN+1問題の回避方法を調査
- **Sources Consulted**:
  - [Efficient Nested Resolvers in AWS AppSync with Lambda Batching](https://dev.to/aws-builders/efficient-nested-resolvers-in-aws-appsync-with-lambda-batching-3jin)
  - [How to Handle Many to Many relations in AppSync](https://benoitboure.com/how-to-handle-many-to-many-relations-in-appsync)
  - [Introducing configurable batching size for AWS AppSync Lambda resolvers](https://aws.amazon.com/blogs/mobile/introducing-configurable-batching-size-for-aws-appsync-lambda-resolvers/)
  - [Using DynamoDB batch operations in AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-dynamodb-batch.html)
- **Findings**:
  - フィールドリゾルバーはリストの各要素に対して個別に実行されるため、N+1問題が発生
  - DynamoDB BatchGetItemオペレーションで複数アイテムを一度に取得可能(最大100アイテム、ただし実用上は5-25が推奨)
  - Lambda Batch Resolversは最大2000アイテムをバッチ処理可能(ペイロードサイズ制限に注意)
  - Pipeline Resolver内でBatchGetItemを使用することで、N+1問題を完全に回避
- **Implications**:
  - `Order.orderItems`フィールドには、orderItemIdのリストをBatchGetItemでバッチ取得するField Resolverを実装
  - `Customer.orders`フィールドには、GSIクエリ + Pipeline Resolverで注文リストを効率的に取得
  - 注文詳細ページでは、Pipeline Resolverで Order → OrderItems(BatchGetItem) → Products(BatchGetItem) を連鎖実行

### AWS CDK v2 AppSync構成パターン

- **Context**: Infrastructure as CodeでAppSync APIとDynamoDBを構築する方法を調査
- **Sources Consulted**:
  - [Building Scalable GraphQL APIs on AWS with CDK, TypeScript](https://aws.amazon.com/blogs/mobile/building-scalable-graphql-apis-on-aws-with-cdk-and-aws-appsync/)
  - [aws-cdk-examples/typescript/appsync-graphql-dynamodb](https://github.com/aws-samples/aws-cdk-examples/tree/main/typescript/appsync-graphql-dynamodb)
  - [AWS CDK v2 AppSync Constructs Documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_appsync.GraphqlApi.html)
- **Findings**:
  - AWS CDK v2では、`aws-cdk-lib`パッケージに統合されたL2 Constructsを使用
  - `GraphqlApi` Constructで認証方式、ロギング、CORS設定を一元管理
  - `DynamoDbDataSource`でテーブルとAPIを接続し、IAMロールが自動生成される
  - JavaScript Resolversは`Code.fromAsset()`または`Code.fromInline()`で定義可能
  - Schema定義は`.graphql`ファイルから`SchemaFile.fromAsset()`で読み込み
- **Implications**:
  - `packages/cdk/lib/appsync/`にスキーマとリゾルバーを配置
  - `packages/cdk/lib/dynamodb/`にテーブル定義を配置
  - 環境変数(dev/staging/prod)によるスタック分離をサポート
  - CloudFormation OutputsでAppSync APIエンドポイントとAPIキーを出力

### フロントエンドGraphQLクライアント選定

- **Context**: React + ViteアプリケーションでAppSync APIに接続する最適なGraphQLクライアントを調査
- **Sources Consulted**:
  - [Building a client application using Amplify client](https://docs.aws.amazon.com/appsync/latest/devguide/building-a-client-app.html)
  - [AWS Amplify v6 migration guide](https://docs.amplify.aws/gen1/react/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/)
  - [Top 5 GraphQL Clients for JavaScript in 2025](https://loadfocus.com/blog/comparisons/graphql-clients/)
  - [AWS CDK: AppSync GraphQL API with Apollo Client in React](https://sbstjn.com/blog/aws-cdk-appsync-graphql-cognito-apollo-react/)
- **Findings**:
  - **AWS公式推奨**: AWS Amplify v6クライアント(自動型生成、リアルタイムデータ、認証統合)
  - Amplify v6では`generateClient()`関数を使用してクライアントを生成
  - `amplifyconfiguration.json`ファイルにエンドポイントと認証情報を自動構成
  - Apollo Client v3も選択肢だが、オフラインサポートがない(v2.4.6以降)
  - Amplify v6はViteとの統合が公式ドキュメントで明示的にサポートされている
- **Implications**:
  - フロントエンドは**AWS Amplify v6**を採用
  - GraphQL操作の型安全性を確保するため、AWS Amplify Code Generationを使用
  - API_KEY認証モードを使用(学習目的のため、本番環境ではCognito推奨)

### モノレポ構成とツールチェーン

- **Context**: pnpm workspacesを使用したmonorepo構成のベストプラクティスを調査
- **Sources Consulted**:
  - [Complete Monorepo Guide: pnpm + Workspace + Changesets (2025)](https://jsdev.space/complete-monorepo-guide/)
  - [Mastering pnpm Workspaces: A Complete Guide](https://blog.glen-thomas.com/software%20engineering/2025/10/02/mastering-pnpm-workspaces-complete-guide-to-monorepo-management.html)
  - [pnpm Workspaces official documentation](https://pnpm.io/workspaces)
- **Findings**:
  - `pnpm-workspace.yaml`ファイルでワークスペースを定義(必須)
  - `workspace:*`プロトコルでローカルパッケージをリンク
  - TypeScript設定はルートの`tsconfig.json`をベースとし、各パッケージで拡張
  - 厳格な`node_modules`により、ファントム依存を防止
  - 並列インストール・リンクによる高速なパフォーマンス
- **Implications**:
  - ルートに`pnpm-workspace.yaml`を配置し、`packages/*`を指定
  - 共有TypeScript型を`packages/shared/types/`に配置し、他パッケージから参照
  - `packages/cdk`、`packages/frontend`、`packages/shared`の3ワークスペース構成

### Biomeによるリント・フォーマット

- **Context**: ESLint + Prettierの代替としてのBiome導入のメリットを調査
- **Sources Consulted**:
  - [Biome official documentation](https://biomejs.dev/)
  - [Biome vs ESLint: The Ultimate 2025 Showdown](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
  - [Biome.js Replaces ESLint and Prettier: 2025 Frontend Code Standards](https://markaicode.com/biome-js-frontend-code-standards-revolution-2025/)
  - [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- **Findings**:
  - Biomeは1000ファイルを50msでフォーマット(Prettier + ESLintは1-2秒)
  - 全CPUコアを活用(ESLintはシングルスレッド)
  - Prettierとの97%互換性、340以上のルールをサポート(2025年時点で398ルール)
  - TypeScript/JSX/JSON/CSS/GraphQLをサポート
  - Biome 2.0(2025年6月リリース)で型推論機能が追加(TypeScript-ESLintの85%をカバー)
- **Implications**:
  - `biome.json`で統一設定を管理
  - React環境用に`"reactClassic"`設定を有効化
  - VCS統合でGit対象ファイルのみをリント・フォーマット
  - 開発サーバー起動時の自動フォーマットで一貫性を確保

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Hexagonal (Ports & Adapters) | ビジネスロジックを外部依存から分離し、ポート経由でアダプター接続 | テスタビリティが高い、複数のAPI形式(REST/GraphQL)を同一ポートでサポート可能、Netflix等の大規模採用事例 | AppSyncのようなサーバーレス環境ではアダプター層の実装コストが増加、学習曲線が急 | サーバーレスではNano/Micro/Macroレベルで適用可能だが、本プロジェクトの規模では過度に複雑 |
| Layered (3-Layer) | Presentation → Business Logic → Data Accessの階層化 | シンプルで直感的、小規模プロジェクトに最適、AWS公式サンプルで広く採用 | 大規模化時に層間の結合度が上昇、ドメインロジックがサービス層に分散しやすい | ✅ **選択**: 学習目的のプロジェクトには最適、AppSync Resolvers(Presentation) → DynamoDB(Data)の明確な分離 |
| Event-Driven | イベントソーシングとCQRSパターンでデータ変更をイベント化 | リアルタイム更新、スケーラビリティ、監査ログの自然な実装 | 実装の複雑度が非常に高い、最終整合性の管理が困難、デバッグが複雑 | ダッシュボードはリアルタイム要求が低く、オーバーエンジニアリング |
| Single-Table DynamoDB | 全エンティティを1つのDynamoDBテーブルに格納し、PKとSKでエンティティを区別 | クエリ数削減、トランザクションサポート、コスト最適化 | スキーマ設計が複雑、アクセスパターンが固定化される、初学者には理解困難 | 本プロジェクトは学習目的のため、マルチテーブル設計を採用し、AppSyncのマルチテーブル結合パターンを習得 |

## Design Decisions

### Decision: AppSync Runtime選択 (APPSYNC_JS vs VTL)

- **Context**: AppSyncリゾルバーの記述言語をVTL(Velocity Template Language)とJavaScriptのどちらにするか
- **Alternatives Considered**:
  1. **VTL (Velocity Template Language)** - レガシーなテンプレート言語、AWS公式サンプルに多数存在
  2. **APPSYNC_JS Runtime** - JavaScriptベースのランタイム、AWS公式が現在推奨
- **Selected Approach**: **APPSYNC_JS Runtime**
- **Rationale**:
  - AWS公式ドキュメントで「APPSYNC_JSランタイムを優先的にサポート」と明記
  - CDKスタック、フロントエンド、リゾルバーをすべてTypeScript/JavaScriptで統一可能
  - VTLは学習曲線が急で、デバッグが困難
  - 複雑なデータ変換ロジックをJavaScriptで表現する方が可読性が高い
- **Trade-offs**:
  - **メリット**: 開発効率向上、可読性向上、エコシステムの統一
  - **デメリット**: VTLの既存サンプルをそのまま流用できない(変換が必要)
- **Follow-up**: リゾルバーのユニットテストを実装し、JavaScript変換ロジックの品質を保証

### Decision: DynamoDB GSI Projection Type

- **Context**: GSIに投影する属性範囲を決定(ストレージコストとクエリパフォーマンスのトレードオフ)
- **Alternatives Considered**:
  1. **KEYS_ONLY** - 最小ストレージ、追加クエリが必要
  2. **INCLUDE** - 頻繁に使用する属性のみ投影
  3. **ALL** - 全属性を投影、追加クエリ不要
- **Selected Approach**: **ALL Projection**
- **Rationale**:
  - ダッシュボードUIはユーザー体験が重要で、レイテンシ最小化が優先
  - ECサイトデータは属性数が少なく(各テーブル5-10属性)、ストレージコスト増加は限定的
  - 学習プロジェクトのため、追加のテーブルクエリ実装よりもシンプルな設計を優先
- **Trade-offs**:
  - **メリット**: クエリレイテンシ最小化、実装の単純化、デバッグの容易化
  - **デメリット**: ストレージコストが約2倍(基底テーブル + GSI)、Write WCUが増加
- **Follow-up**: CloudWatch Metricsでストレージコストとクエリパフォーマンスを監視

### Decision: GraphQLクライアントライブラリ選定

- **Context**: React + ViteフロントエンドでAppSync APIに接続するクライアントライブラリ選定
- **Alternatives Considered**:
  1. **AWS Amplify v6** - AWS公式、自動型生成、認証統合
  2. **Apollo Client v3** - 豊富な機能、大規模コミュニティ
  3. **Native Fetch + GraphQL** - 最軽量、手動実装
- **Selected Approach**: **AWS Amplify v6**
- **Rationale**:
  - AWS公式推奨で、AppSyncとの統合が最も洗練されている
  - `generateClient()`による自動型生成でTypeScript型安全性を確保
  - `amplifyconfiguration.json`による自動構成で設定ミスを防止
  - リアルタイムサブスクリプション(将来拡張)のサポートが標準装備
- **Trade-offs**:
  - **メリット**: 開発速度、型安全性、AWS生態系との親和性
  - **デメリット**: Amplify依存による柔軟性低下、Apollo Clientの高度なキャッシュ戦略が利用不可
- **Follow-up**: GraphQL Code Generatorで型定義を自動生成し、フロントエンドの型安全性を強化

### Decision: マルチテーブル vs シングルテーブル設計

- **Context**: DynamoDBのテーブル設計パターン選定
- **Alternatives Considered**:
  1. **マルチテーブル** - エンティティごとにテーブル分離、正規化設計
  2. **シングルテーブル** - 全エンティティを1テーブルに集約、PKとSKで区別
- **Selected Approach**: **マルチテーブル設計**
- **Rationale**:
  - 学習目的のプロジェクトのため、AppSyncのマルチテーブル結合パターンを習得することが主目的
  - アクセスパターンが未確定の場合、マルチテーブルの方が柔軟性が高い(AWS公式推奨)
  - 正規化設計により、データ整合性が理解しやすい
  - シングルテーブル設計は初学者には複雑で、スキーマ変更が困難
- **Trade-offs**:
  - **メリット**: スキーマの理解が容易、RDBMSからの移行パスが自然、テーブル単位のアクセス制御が簡単
  - **デメリット**: クエリ数が増加(AppSyncのPipeline Resolverで解決)、トランザクション制約(1テーブルのみサポート)
- **Follow-up**: 実装完了後、シングルテーブル設計への移行手順をドキュメント化し、比較学習の材料とする

## Risks & Mitigations

- **Risk 1: DynamoDB GSIスロットリング** — GSI書き込みキャパシティが不足すると、基底テーブルの全書き込みがスロットリングされる
  - **Mitigation**: GSIとベーステーブルのWCUを同等に設定、CloudWatch Alarmsで`WriteThrottleEvents`を監視、オンデマンド課金モードを採用してキャパシティプランニングを自動化
- **Risk 2: AppSync Pipeline Resolverのデバッグ困難** — 複数ステップの連鎖でエラー発生箇所の特定が困難
  - **Mitigation**: CloudWatch Logsで`DEBUG`レベルロギングを有効化、各ステップで`console.log()`相当のログ出力、ユニットテストで各Function Stepを個別に検証
- **Risk 3: N+1クエリ問題の見落とし** — Field Resolverの誤実装でN+1問題が発生し、パフォーマンス劣化
  - **Mitigation**: GraphQL Queryの実行計画を可視化、AppSync Query Complexity Analysisを有効化、BatchGetItemの使用を強制するコードレビューチェックリスト作成
- **Risk 4: フロントエンドとバックエンドのスキーマ不整合** — GraphQLスキーマ変更時の型定義ずれ
  - **Mitigation**: AWS Amplify Code Generationで自動型生成、CI/CDパイプラインでスキーマ変更検知、スキーマファーストアプローチ採用
- **Risk 5: pnpm workspacesの依存関係ループ** — ワークスペース間の循環依存によるビルドエラー
  - **Mitigation**: 依存関係グラフを可視化(`pnpm list --depth=Infinity`)、共有型は`packages/shared`に集約し単方向依存を強制、依存関係リンターツール(madge等)の導入

## References

### AWS AppSync & DynamoDB
- [Practical use cases for AWS AppSync Pipeline Resolvers – Part 2: Data Aggregation](https://aws.amazon.com/blogs/mobile/appsync-pipeline-resolvers-2/)
- [Using pipeline resolvers in AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-pipeline-resolvers.html)
- [Single-table vs multi-table DynamoDB design patterns with GraphQL APIs](https://aws.amazon.com/blogs/mobile/single-table-vs-multi-table-dynamodb-appsync/)
- [Using DynamoDB batch operations in AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-dynamodb-batch.html)
- [Global Secondary Indexes (GSI) in DynamoDB: Complete Guide (2025)](https://dynomate.io/blog/dynamodb-gsi/)
- [Using DynamoDB as a data store for an online shop](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/data-modeling-online-shop.html)

### Architecture Patterns
- [Hexagonal architecture pattern - AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html)
- [Serverless: Applying Hexagonal Architecture at Multiple Levels](https://medium.com/@jgilbert001/serverless-applying-hexagonal-architecture-at-multiple-levels-c8fe7b197850)

### AWS CDK
- [Building Scalable GraphQL APIs on AWS with CDK, TypeScript](https://aws.amazon.com/blogs/mobile/building-scalable-graphql-apis-on-aws-with-cdk-and-aws-appsync/)
- [aws-cdk-examples/typescript/appsync-graphql-dynamodb](https://github.com/aws-samples/aws-cdk-examples/tree/main/typescript/appsync-graphql-dynamodb)

### Frontend & Tooling
- [Building a client application using Amplify client](https://docs.aws.amazon.com/appsync/latest/devguide/building-a-client-app.html)
- [Complete Monorepo Guide: pnpm + Workspace + Changesets (2025)](https://jsdev.space/complete-monorepo-guide/)
- [Biome official documentation](https://biomejs.dev/)
- [Biome vs ESLint: The Ultimate 2025 Showdown](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
