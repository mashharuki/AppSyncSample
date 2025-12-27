/**
 * listOrdersByCustomer Query Resolver
 * customer-order-gsiを使用したDynamoDB Queryオペレーションを実装
 * customerIdをパーティションキー、orderDateをソートキーとして注文リストを取得
 * ページネーション(limit、nextToken)をサポート
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { customerId, limit, nextToken } = ctx.arguments;

  return {
    operation: 'Query',
    index: 'customer-order-gsi',
    query: {
      expression: 'customerId = :customerId',
      expressionValues: {
        ':customerId': { S: customerId },
      },
    },
    limit: limit || 20,
    nextToken: nextToken || null,
    scanIndexForward: false, // orderDateで降順ソート（最新の注文が先）
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return {
    items: ctx.result.items,
    nextToken: ctx.result.nextToken || null,
  };
}
