/**
 * Customer.orders Field Resolver
 * 顧客の注文履歴を遅延読み込み（Field Resolver）
 * customer-order-gsiを使用してDynamoDB Queryオペレーションを実行
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  // Field Resolverの場合、親オブジェクト（Customer）はctx.sourceに含まれる
  const { customerId } = ctx.source;

  // 引数からlimitとnextTokenを取得（オプション）
  const { limit, nextToken } = ctx.arguments;

  return {
    operation: 'Query',
    index: 'customer-order-gsi',
    query: {
      expression: 'customerId = :customerId',
      expressionValues: util.dynamodb.toMapValues({
        ':customerId': customerId,
      }),
    },
    // ページネーションサポート
    limit: limit || 20,
    nextToken: nextToken || null,
    // orderDateでソート（降順 - 最新の注文が先）
    scanIndexForward: false,
  };
}

export function response(ctx) {
  // GSIクエリ失敗時のエラーハンドリング
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // DynamoDBクエリの結果を返却
  // items配列とnextTokenを含む
  return ctx.result.items || [];
}
