/**
 * getOrder Pipeline Resolver - Function 2: GetCustomer
 * CustomersテーブルからCustomerを取得し、結果をstash.customerに保存
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { customerId } = ctx.stash.order;

  return {
    operation: 'GetItem',
    key: {
      customerId: { S: customerId },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // Customerが存在しない場合でもエラーとはせず、nullを設定
  // （データ整合性の問題はあるが、Order自体は返す）
  ctx.stash.customer = ctx.result || null;
  return ctx.result;
}
