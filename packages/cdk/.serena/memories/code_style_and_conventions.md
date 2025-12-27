# コードスタイルと規約

## TypeScript (CDKスタック)
- **型定義**: 明示的な型定義を使用 (`interface`, `type`, `: Type`)
- **命名規則**:
  - クラス: PascalCase (`DynamoDBStack`, `AppSyncStack`)
  - 変数/関数: camelCase (`customersTable`, `createCustomer`)
  - 定数: UPPER_SNAKE_CASE (使用する場合)
- **コメント**: 日本語でJSDocスタイル
- **インポート**: `node:` プレフィックスを使用 (`import { join } from 'node:path'`)

## JavaScript (AppSyncリゾルバー)
- **ランタイム**: AppSync JavaScript Runtime 1.0.0
- **必須インポート**: `import { util } from '@aws-appsync/utils';`
- **エクスポート**: `export function request(ctx)` と `export function response(ctx)`
- **コメント**: 日本語でJSDocスタイル
- **命名規則**: camelCase

## AppSync固有のパターン

### 1. DynamoDB操作の形式
**GetItem**:
```javascript
{
  operation: 'GetItem',
  key: util.dynamodb.toMapValues({ id }),
}
```

**PutItem**:
```javascript
{
  operation: 'PutItem',
  key: util.dynamodb.toMapValues({ id }),
  attributeValues: util.dynamodb.toMapValues({ field1, field2 }),
}
```

**Query**:
```javascript
{
  operation: 'Query',
  query: {
    expression: 'field = :value',
    expressionValues: util.dynamodb.toMapValues({ ':value': value }),
  },
}
```

**BatchGetItem**:
```javascript
{
  operation: 'BatchGetItem',
  tables: {
    TableName: keys,  // 配列を直接割り当て
  },
}
```

### 2. Pipeline Resolver
- **データ共有**: `ctx.stash` を使用
- **前のステップの結果**: `ctx.prev.result` を使用
- **引数のアクセス**: pipeline.jsで `ctx.stash` に保存してから使用

### 3. エラーハンドリング
```javascript
if (ctx.error) {
  return util.error(ctx.error.message, ctx.error.type);
}
```

## ファイル構成規約
- **リゾルバーファイル名**: `typeName.fieldName.js` または `fieldName.js`
- **Pipeline関数**: `function-N-description.js` (Nは1から始まる番号)
- **テストファイル**: `*.test.ts`

## 重要な注意事項
- ❌ VTL形式の`{ S: value }`を使用しない
- ✅ `util.dynamodb.toMapValues()`を使用する
- ❌ Pipeline Functionで`ctx.arguments`に直接アクセスしない
- ✅ `ctx.stash`経由でアクセスする
- ❌ PutItemで`item`パラメータを使用しない
- ✅ `key`と`attributeValues`を分離する
