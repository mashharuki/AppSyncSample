/**
 * getOrder Pipeline Resolver - Function 1: GetOrder
 * OrdersテーブルからOrderを取得し、結果をstash.orderに保存
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { orderId } = ctx.prev.result;

  return {
    operation: 'GetItem',
    key: {
      orderId: { S: orderId },
      orderId: { S: orderId },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // Orderが存在しない場合はエラー
  if (!ctx.result) {
    return util.error('Order not found', 'NotFound');
  }

  // stash.orderに保存して次のステップに渡す
  ctx.stash.order = ctx.result;
  return ctx.result;
}
