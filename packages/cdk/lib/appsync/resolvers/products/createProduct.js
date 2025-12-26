/**
 * createProduct Mutation Resolver
 * UUID v4でproductIdを自動生成し、商品を作成
 * 価格バリデーション(正の数値チェック)を実行
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { name, category, price, description } = ctx.arguments.input;

  // 価格バリデーション: 正の数値チェック
  if (price <= 0) {
    util.error('Price must be a positive number', 'ValidationError');
  }

  // カテゴリ名を小文字に正規化
  const normalizedCategory = category.toLowerCase();

  // UUID v4を生成
  const productId = util.autoId();
  const now = util.time.nowISO8601();

  return {
    operation: 'PutItem',
    key: {
      productId: { S: productId },
    },
    attributeValues: {
      name: { S: name },
      category: { S: normalizedCategory },
      price: { N: price.toString() },
      description: { S: description || '' },
      createdAt: { S: now },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
}
