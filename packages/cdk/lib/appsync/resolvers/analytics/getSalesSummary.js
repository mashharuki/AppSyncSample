/**
 * getSalesSummary Query Resolver
 * OrdersテーブルScanオペレーションで全注文を取得し、売上サマリーを計算
 * - totalRevenue: 合計売上
 * - orderCount: 注文数
 * - averageOrderValue: 平均注文額
 */

import { util } from '@aws-appsync/utils';

export function request(_ctx) {
  return {
    operation: 'Scan',
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  const orders = ctx.result.items || [];

  // データがない場合は全てのフィールドに0を返す
  if (orders.length === 0) {
    return {
      totalRevenue: 0,
      orderCount: 0,
      averageOrderValue: 0,
    };
  }

  // totalRevenue(合計売上)を計算
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  // orderCount(注文数)
  const orderCount = orders.length;

  // averageOrderValue(平均注文額)
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    totalRevenue,
    orderCount,
    averageOrderValue,
  };
}
