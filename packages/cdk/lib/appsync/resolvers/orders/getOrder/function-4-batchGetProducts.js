/**
 * getOrder Pipeline Resolver - Function 4: BatchGetProducts
 * ProductsテーブルからProductsを一括取得し、結果をstash.productsに保存
 *
 * BatchGetItemを使用してN+1問題を回避
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const orderItems = ctx.stash.orderItems || [];

  // OrderItemsが空の場合は何もしない
  if (orderItems.length === 0) {
    return {
      operation: 'BatchGetItem',
      tables: {
        Products: [],
      },
    };
  }

  // productIdのリストを抽出
  const productIds = orderItems.map((item) => item.productId);

  // 重複を除去
  const uniqueProductIds = [...new Set(productIds)];

  // BatchGetItemリクエストを構築
  const keys = uniqueProductIds.map((productId) => ({
    productId: { S: productId },
    productId: { S: productId },
  }));

  return {
    operation: 'BatchGetItem',
    tables: {
      Products: {
        keys,
        consistentRead: false,
      },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // Productsが存在しない場合は空配列
  const products = ctx.result?.data?.Products || [];
  ctx.stash.products = products;
  return products;
}
