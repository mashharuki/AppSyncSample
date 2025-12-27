/**
 * getProductRanking Function 1: AggregateOrderItems
 * OrderItemsテーブルをScanし、productIdごとに数量を集計してソート
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

  const orderItems = ctx.result.items || [];

  // データがない場合は空配列を返す
  if (orderItems.length === 0) {
    return [];
  }

  // productIdごとに数量を集計
  const productSales = {};

  for (const item of orderItems) {
    const productId = item.productId;
    const quantity = item.quantity || 0;

    if (!productSales[productId]) {
      productSales[productId] = 0;
    }
    productSales[productId] += quantity;
  }

  // 販売数量でソート（降順）
  const sortedProducts = Object.entries(productSales)
    .map(([productId, totalQuantity]) => ({
      productId,
      totalQuantity,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  // limit引数に従い上位N件を抽出（デフォルト10）
  const limit = ctx.arguments.limit || 10;
  const topProducts = sortedProducts.slice(0, limit);

  // 次のFunctionのためにstashに保存
  ctx.stash.productRankings = topProducts;

  return topProducts;
}
