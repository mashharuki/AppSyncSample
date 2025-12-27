# 完了したタスクのログ

## 2025-12-27: DynamoDBテーブルのキースキーマエラー修正

### 問題
CDKデプロイ時に `AppSyncSampleDynamoDBStack` が以下のエラーで失敗：
```
Both the Hash Key and the Range Key element in the KeySchema have the same name
```

### 原因
`packages/cdk/lib/dynamodb/tables.ts` で、全てのDynamoDBテーブルのパーティションキー（Hash Key）とソートキー（Range Key）に同じ属性名が設定されていた。

### 解決策
各テーブルのIDだけで一意性が保証されるため、全てのテーブルから `sortKey` 定義を削除。各テーブルは単一キーテーブルとして再定義。

### 修正ファイル
- `packages/cdk/lib/dynamodb/tables.ts`: 4つのテーブル関数全てから `sortKey` プロパティを削除

---

## 2025-12-27: AppSyncリゾルバーのDynamoDB AttributeValue形式エラー修正

### 問題
CDKデプロイ時に `AppSyncSampleAppSyncStack` が以下のエラーで失敗：
```
The code contains one or more errors. (Service: AppSync, Status Code: 400)
```

### 原因
AppSync JavaScript Runtime 1.0.0では、DynamoDBのキーや値を指定する際に **AttributeValue形式（`{ S: value }`, `{ N: value }` など）を使用できない**。

### 解決策
AppSync JS Runtime 1.0.0では `util.dynamodb.toMapValues()` ヘルパー関数を使用する。

### 修正ファイル（13ファイル）
顧客、商品、注文リゾルバーおよびPipeline Function全て

---

## 2025-12-27: AppSync Pipeline Function内でのctx.argumentsアクセスエラー修正

### 問題
CDKデプロイ時に `AggregateOrderItemsFunction` が以下のエラーで失敗：
```
The code contains one or more errors. (Service: AppSync, Status Code: 400)
```

### 原因
1. Pipeline Function内では `ctx.arguments` に直接アクセスできない
2. BatchGetItemのキー変換漏れ
3. Pipeline Function間のデータ受け渡しミス

### 解決策
1. Pipeline Resolverで引数をstashに保存
2. Pipeline Functionでstashから取得
3. BatchGetItemのキー変換追加
4. stashからデータ取得するように修正

### 修正ファイル
1. `packages/cdk/lib/appsync/resolvers/analytics/getProductRanking/pipeline.js`
2. `packages/cdk/lib/appsync/resolvers/analytics/getProductRanking/function-1-aggregateOrderItems.js`
3. `packages/cdk/lib/appsync/resolvers/analytics/getProductRanking/function-2-batchGetProducts.js`
4. `packages/cdk/lib/appsync/resolvers/orders/getOrder/function-3-getOrderItems.js`

---

## 2025-12-27: AppSync PutItemオペレーションのパラメータエラー修正

### 問題
CDKデプロイ時に全てのリゾルバーが以下のエラーで失敗：
```
The code contains one or more errors. (Service: AppSync, Status Code: 400)
```

### 原因
PutItemオペレーションで誤って `item` パラメータを使用していた。**AppSync JavaScript Runtimeでは、DynamoDBのPutItemオペレーションでは `key` と `attributeValues` を別々に指定する必要がある**。

**誤った実装:**
```javascript
return {
  operation: 'PutItem',
  item: util.dynamodb.toMapValues({ customerId, name, email, createdAt: now }),
};
```

**正しい実装:**
```javascript
return {
  operation: 'PutItem',
  key: util.dynamodb.toMapValues({ customerId }),
  attributeValues: util.dynamodb.toMapValues({ name, email, createdAt: now }),
};
```

### 修正ファイル
1. `packages/cdk/lib/appsync/resolvers/customers/createCustomer.js`
2. `packages/cdk/lib/appsync/resolvers/products/createProduct.js`
3. `packages/cdk/lib/appsync/resolvers/orders/createOrder.js`

---

## 2025-12-27: AppSync BatchGetItemオペレーションの構文エラー修正（最終版）

### 問題
CDKデプロイ時に `BatchGetProductsFunction` が以下のエラーで失敗：
```
The code contains one or more errors. (Service: AppSync, Status Code: 400)
```

### 原因
BatchGetItemオペレーションで `tables` の構文が間違っていた。

**誤った実装（配列を直接指定）:**
```javascript
return {
  operation: 'BatchGetItem',
  tables: {
    Products: keys,  // ❌ 配列を直接指定
  },
};
```

AWSドキュメント ([BatchGetItem - AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/js-aws-appsync-resolver-reference-dynamodb-batch-get-item.html)) のTypeScript型定義によると、**オブジェクト形式で `keys` プロパティが必要**：

```typescript
type DynamoDBBatchGetItemRequest = {
  operation: 'BatchGetItem';
  tables: {
    [tableName: string]: {
      keys: { [key: string]: any }[];  // keysプロパティが必要
      consistentRead?: boolean; 
      projection?: {...};
    };
  };
};
```

**正しい実装（オブジェクト形式）:**
```javascript
return {
  operation: 'BatchGetItem',
  tables: {
    Products: {
      keys: keys,  // ✅ keysプロパティを含むオブジェクト
    },
  },
};
```

### 解決策
BatchGetItemの `tables` パラメータで、オブジェクト形式（`keys`プロパティを含む）に修正。

**修正内容:**
1. `tables.Products` を配列からオブジェクト形式 `{ keys: [...] }` に変更
2. 空の場合も `Products: { keys: [] }` として統一

### 修正ファイル
1. `packages/cdk/lib/appsync/resolvers/orders/getOrder/function-4-batchGetProducts.js`
2. `packages/cdk/lib/appsync/resolvers/analytics/getProductRanking/function-2-batchGetProducts.js`

### 影響
- BatchGetItem操作が正しいオブジェクト形式に修正された
- 2つのPipeline FunctionでBatchGetItemが正常に動作する予定

### 備考
AWSドキュメントの例では配列を直接指定しているように見えますが、TypeScript型定義では完全なオブジェクト形式（`keys`プロパティ含む）が要求されます。本番環境ではオブジェクト形式を使用することを推奨します。
