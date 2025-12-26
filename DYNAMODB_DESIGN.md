# DynamoDB テーブル設計 - ECサイトダッシュボード

## 概要

このドキュメントでは、ECサイトのダッシュボードを実現するためのDynamoDBテーブル設計を説明します。
複数テーブルにまたがるデータをAppSyncのGraphQL APIで効率的に取得できるよう設計しています。

## アクセスパターン

ダッシュボードで必要な主なクエリ：

1. **顧客管理**
   - 顧客IDで顧客情報を取得
   - メールアドレスで顧客を検索
   - すべての顧客一覧を取得

2. **商品管理**
   - 商品IDで商品情報を取得
   - カテゴリ別の商品一覧を取得
   - すべての商品一覧を取得

3. **注文管理**
   - 注文IDで注文詳細を取得（顧客情報 + 注文明細 + 商品情報）
   - 顧客別の注文履歴を取得
   - 期間別の注文一覧を取得
   - 注文ステータス別の一覧を取得

4. **ダッシュボード集計**
   - 売上サマリー（期間別）
   - 人気商品ランキング
   - 顧客別購入統計

## テーブル設計

### 1. Customers テーブル

顧客情報を管理するテーブル。

| 属性名 | 型 | 説明 |
|--------|-----|------|
| PK | String | `CUSTOMER#<customerId>` |
| SK | String | `METADATA` |
| customerId | String | 顧客ID（UUID） |
| email | String | メールアドレス（ユニーク） |
| name | String | 顧客名 |
| phone | String | 電話番号 |
| address | Map | 住所情報（郵便番号、都道府県、市区町村、番地） |
| createdAt | String | 作成日時（ISO 8601） |
| updatedAt | String | 更新日時（ISO 8601） |

**GSI1: EmailIndex**
- PK: `email`
- SK: -
- 用途: メールアドレスでの顧客検索

**サンプルデータ:**
```json
{
  "PK": "CUSTOMER#c1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o",
  "SK": "METADATA",
  "customerId": "c1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o",
  "email": "tanaka@example.com",
  "name": "田中太郎",
  "phone": "090-1234-5678",
  "address": {
    "postalCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. Products テーブル

商品情報を管理するテーブル。

| 属性名 | 型 | 説明 |
|--------|-----|------|
| PK | String | `PRODUCT#<productId>` |
| SK | String | `METADATA` |
| productId | String | 商品ID（UUID） |
| name | String | 商品名 |
| description | String | 商品説明 |
| price | Number | 価格（円） |
| category | String | カテゴリ（例: Electronics, Books, Clothing） |
| stock | Number | 在庫数 |
| imageUrl | String | 商品画像URL |
| createdAt | String | 作成日時（ISO 8601） |
| updatedAt | String | 更新日時（ISO 8601） |

**GSI1: CategoryIndex**
- PK: `category`
- SK: `createdAt`
- 用途: カテゴリ別の商品一覧取得（作成日順）

**サンプルデータ:**
```json
{
  "PK": "PRODUCT#p7a8b9c0-d1e2-3f4g-5h6i-7j8k9l0m1n2o",
  "SK": "METADATA",
  "productId": "p7a8b9c0-d1e2-3f4g-5h6i-7j8k9l0m1n2o",
  "name": "ワイヤレスイヤホン XZ-100",
  "description": "高音質・ノイズキャンセリング機能付き",
  "price": 15800,
  "category": "Electronics",
  "stock": 45,
  "imageUrl": "https://example.com/products/xz100.jpg",
  "createdAt": "2024-02-01T09:00:00Z",
  "updatedAt": "2024-02-10T14:30:00Z"
}
```

---

### 3. Orders テーブル

注文情報を管理するテーブル。

| 属性名 | 型 | 説明 |
|--------|-----|------|
| PK | String | `ORDER#<orderId>` |
| SK | String | `METADATA` |
| orderId | String | 注文ID（UUID） |
| customerId | String | 顧客ID（外部参照） |
| orderDate | String | 注文日時（ISO 8601） |
| status | String | ステータス（PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED） |
| totalAmount | Number | 注文合計金額（円） |
| shippingAddress | Map | 配送先住所 |
| createdAt | String | 作成日時（ISO 8601） |
| updatedAt | String | 更新日時（ISO 8601） |

**GSI1: CustomerOrdersIndex**
- PK: `customerId`
- SK: `orderDate`（降順）
- 用途: 顧客別の注文履歴取得（最新順）

**GSI2: OrderDateIndex**
- PK: `STATUS#<status>`
- SK: `orderDate`
- 用途: ステータス別・期間別の注文一覧取得

**サンプルデータ:**
```json
{
  "PK": "ORDER#o3b4c5d6-e7f8-9g0h-1i2j-3k4l5m6n7o8p",
  "SK": "METADATA",
  "orderId": "o3b4c5d6-e7f8-9g0h-1i2j-3k4l5m6n7o8p",
  "customerId": "c1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o",
  "orderDate": "2024-03-20T14:25:00Z",
  "status": "DELIVERED",
  "totalAmount": 32600,
  "shippingAddress": {
    "postalCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1-1"
  },
  "createdAt": "2024-03-20T14:25:00Z",
  "updatedAt": "2024-03-25T10:00:00Z"
}
```

---

### 4. OrderItems テーブル

注文明細（注文に含まれる商品）を管理するテーブル。

| 属性名 | 型 | 説明 |
|--------|-----|------|
| PK | String | `ORDER#<orderId>` |
| SK | String | `ITEM#<productId>` |
| orderId | String | 注文ID（外部参照） |
| productId | String | 商品ID（外部参照） |
| quantity | Number | 数量 |
| unitPrice | Number | 単価（注文時の価格） |
| subtotal | Number | 小計（quantity × unitPrice） |
| createdAt | String | 作成日時（ISO 8601） |

**GSI1: ProductSalesIndex**
- PK: `productId`
- SK: `createdAt`
- 用途: 商品別の販売履歴・統計取得

**サンプルデータ:**
```json
{
  "PK": "ORDER#o3b4c5d6-e7f8-9g0h-1i2j-3k4l5m6n7o8p",
  "SK": "ITEM#p7a8b9c0-d1e2-3f4g-5h6i-7j8k9l0m1n2o",
  "orderId": "o3b4c5d6-e7f8-9g0h-1i2j-3k4l5m6n7o8p",
  "productId": "p7a8b9c0-d1e2-3f4g-5h6i-7j8k9l0m1n2o",
  "quantity": 2,
  "unitPrice": 15800,
  "subtotal": 31600,
  "createdAt": "2024-03-20T14:25:00Z"
}
```

---

## AppSyncでの結合パターン

DynamoDBでは直接的なJOINはできませんが、AppSyncのリゾルバーを使って複数テーブルのデータを結合します。

### パターン1: Pipeline Resolver（推奨）

複数のDynamoDBクエリを順次実行し、結果を組み合わせます。

**例: 注文詳細の取得（顧客情報 + 注文情報 + 注文明細 + 商品情報）**

1. Ordersテーブルから注文情報を取得
2. Customersテーブルから顧客情報を取得（customerId使用）
3. OrderItemsテーブルから注文明細を取得（orderId使用）
4. Productsテーブルから各商品情報を取得（productId使用）

```graphql
type Query {
  getOrderDetail(orderId: ID!): OrderDetail
}

type OrderDetail {
  order: Order!
  customer: Customer!
  items: [OrderItemDetail!]!
}

type OrderItemDetail {
  product: Product!
  quantity: Int!
  unitPrice: Float!
  subtotal: Float!
}
```

### パターン2: Batch Resolver

複数のアイテムを一度に取得する際に、BatchGetItemを使用して効率化します。

**例: 注文明細の商品情報を一括取得**

```javascript
// Batch Resolver例
{
  "version": "2018-05-29",
  "operation": "BatchGetItem",
  "tables": {
    "Products": {
      "keys": $util.toJson($ctx.source.items.map(item => { "PK": "PRODUCT#${item.productId}", "SK": "METADATA" }))
    }
  }
}
```

### パターン3: Field Resolver

GraphQLのフィールドレベルでリゾルバーを定義し、必要に応じてデータを取得します。

**例: Orderタイプのcustomerフィールド**

```graphql
type Order {
  orderId: ID!
  customer: Customer! # Field Resolverで取得
  orderDate: AWSDateTime!
  status: OrderStatus!
  totalAmount: Float!
}
```

Field Resolverで`customerId`を使ってCustomersテーブルから顧客情報を取得します。

---

## ダッシュボードのユースケース実装例

### 1. 売上サマリーの取得

**GraphQLクエリ:**
```graphql
query GetSalesSummary($startDate: AWSDateTime!, $endDate: AWSDateTime!) {
  salesSummary(startDate: $startDate, endDate: $endDate) {
    totalOrders
    totalRevenue
    averageOrderValue
    topProducts {
      product {
        productId
        name
      }
      totalQuantity
      totalRevenue
    }
  }
}
```

**実装方法:**
- OrderDateIndexを使って期間内の注文を取得
- OrderItemsテーブルと結合して商品別売上を集計
- AppSyncのリゾルバーまたはLambda関数で集計処理

### 2. 顧客の注文履歴

**GraphQLクエリ:**
```graphql
query GetCustomerOrders($customerId: ID!, $limit: Int) {
  customerOrders(customerId: $customerId, limit: $limit) {
    items {
      orderId
      orderDate
      status
      totalAmount
      items {
        product {
          name
          imageUrl
        }
        quantity
        subtotal
      }
    }
  }
}
```

**実装方法:**
- CustomerOrdersIndex（GSI1）を使って顧客の注文一覧を取得
- Pipeline Resolverで注文明細と商品情報を結合

### 3. 商品別販売統計

**GraphQLクエリ:**
```graphql
query GetProductStats($productId: ID!) {
  productStats(productId: $productId) {
    product {
      productId
      name
      price
      stock
    }
    totalQuantitySold
    totalRevenue
    orderCount
    recentOrders {
      orderId
      orderDate
      quantity
      customer {
        name
      }
    }
  }
}
```

**実装方法:**
- Productsテーブルから商品情報を取得
- ProductSalesIndex（OrderItemsのGSI1）を使って販売履歴を取得
- Lambda関数で統計を計算

---

## テーブル設計の利点

### 1. 効率的なクエリ
- 各テーブルに適切なGSIを設定することで、様々なアクセスパターンに対応
- Partition Keyの分散により、スケーラブルな設計

### 2. AppSyncとの親和性
- GraphQLのネストされたクエリに対応しやすい構造
- Pipeline ResolverやField Resolverで柔軟にデータを結合

### 3. データの正規化
- 商品情報の変更が注文履歴に影響しない
- 注文時の価格を保持（unitPrice）することで履歴の正確性を維持

### 4. 拡張性
- 新しいアクセスパターンにはGSIを追加
- 集計データが必要な場合はDynamoDB StreamsとLambdaで別テーブルに保存

---

## Single Table Design との比較

このドキュメントでは **複数テーブル設計** を採用していますが、DynamoDBのベストプラクティスとして **Single Table Design** もあります。

### Multiple Tables（このドキュメント）の利点
- 理解しやすい（リレーショナルDBに近い）
- エンティティごとに独立して管理可能
- スキーマが明確

### Single Table Design の利点
- クエリ回数を減らせる（1回のQueryで複数エンティティ取得可能）
- コストとレイテンシの最適化
- トランザクション処理がしやすい

学習目的であれば、まずは複数テーブルで始めて、Single Table Designの必要性が出てきたら移行するのが良いでしょう。

---

このテーブル設計により、テーブル結合ができないDynamoDBでも、AppSyncを使って複数テーブルのデータを効率的に取得できるダッシュボードを実現できます。
