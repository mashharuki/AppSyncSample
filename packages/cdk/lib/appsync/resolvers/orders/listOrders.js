/**
 * listOrders Query Resolver
 * DynamoDB Scanオペレーションで注文一覧を取得
 * ページネーション(limit、nextToken)をサポート
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { limit, nextToken } = ctx.arguments;

  return {
    operation: 'Scan',
    limit: limit || 20,
    nextToken: nextToken || null,
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
