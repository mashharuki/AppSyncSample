# 最近の修正履歴

## 修正1: DynamoDB KeySchemaエラー
**エラー**: "Both the Hash Key and the Range Key element in the KeySchema have the same name"

**原因**: 全てのテーブルでpartitionKeyとsortKeyが同じ属性名を使用していた

**修正内容**:
- `lib/dynamodb/tables.ts`から全テーブルの`sortKey`を削除
- 影響を受けたテーブル: Customers, Products, Orders, OrderItems
- 対応するテストも更新 (`test/dynamodb/tables.test.ts`)

## 修正2: AppSyncリゾルバーのAttributeValue形式エラー
**エラー**: "The code contains one or more errors" (複数のリゾルバー)

**原因**: VTL形式の`{ S: value }`を使用していた (AppSync JS Runtime 1.0.0では非対応)

**修正内容**:
- `util.dynamodb.toMapValues({ key: value })`形式に変更
- 影響を受けたファイル: 13+のリゾルバー
- パターン: GetItem, Query, PutItemの全てで適用

## 修正3: Pipeline Function ctx.argumentsアクセスエラー
**エラー**: "The code contains one or more errors" (AggregateOrderItemsFunction)

**原因**: Pipeline FunctionでctxctxargumentsからlimitArgumentsに直接アクセスできない

**修正内容**:
- `pipeline.js`で`ctx.arguments`を`ctx.stash`に保存
- Function内で`ctx.stash`から読み取るように変更
- 影響ファイル: 
  - `lib/appsync/resolvers/analytics/getProductRanking/pipeline.js`
  - `lib/appsync/resolvers/analytics/getProductRanking/function-1-aggregateOrderItems.js`

## 修正4: PutItem操作の構文エラー
**エラー**: "The code contains one or more errors" (全mutationリゾルバー)

**原因**: `item`パラメータを使用していた

**修正内容**:
- `key`と`attributeValues`を分離
- 正しい形式:
  ```javascript
  {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ id }),
    attributeValues: util.dynamodb.toMapValues({ ...fields }),
  }
  ```
- 影響ファイル:
  - `createCustomer.js`
  - `createProduct.js`
  - `createOrder.js`

## 修正5: BatchGetItem構文エラー
**エラー**: "The code contains one or more errors" (BatchGetProductsFunction)

**原因**: `tables: { Products: { keys, consistentRead } }`形式を使用していた

**修正内容**:
- 配列を直接割り当てる形式に変更: `tables: { Products: keys }`
- 影響ファイル:
  - `lib/appsync/resolvers/orders/getOrder/function-4-batchGetProducts.js`
  - `lib/appsync/resolvers/analytics/getProductRanking/function-2-batchGetProducts.js`

**AWS参考ドキュメント**:
- https://docs.aws.amazon.com/appsync/latest/devguide/migrating-resolvers.html
- https://docs.aws.amazon.com/appsync/latest/devguide/js-aws-appsync-resolver-reference-dynamodb-batch-get-item.html

## テスト結果
全ての修正後、97個全てのテストが成功:
```
Test Files  10 passed (10)
Tests       97 passed (97)
```

## 重要な学び
1. AppSync JS Runtime 1.0.0では必ず`util.dynamodb.toMapValues()`を使用
2. Pipeline Resolverでは`ctx.stash`でデータを共有
3. PutItemは`key`と`attributeValues`を分離
4. BatchGetItemのtablesは配列を直接割り当て
5. 公式AWSドキュメントを参照して正しい構文を確認
