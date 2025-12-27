/**
 * getOrder Pipeline Resolver - Function 3: GetOrderItems
 * OrderItemsテーブルからOrderItemsを取得し、結果をstash.orderItemsに保存
 *
 * Note: orderIdでクエリするため、order-items-gsi (orderId GSI)を使用
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { orderId } = ctx.stash.order;

  return {
    operation: 'Query',
    index: 'order-items-gsi',
    query: {
      expression: 'orderId = :orderId',
      expressionValues: util.dynamodb.toMapValues({
        ':orderId': orderId,
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // OrderItemsが存在しない場合は空配列
  ctx.stash.orderItems = ctx.result.items || [];
  return ctx.result.items || [];
}
