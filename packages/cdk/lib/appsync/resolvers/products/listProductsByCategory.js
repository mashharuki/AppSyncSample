/**
 * listProductsByCategory Query Resolver
 * category-gsiを使用したDynamoDB Queryオペレーションを実装
 * カテゴリパラメータを小文字に正規化し、GSIクエリを実行
 * ページネーション(limit、nextToken)をサポート
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { category, limit, nextToken } = ctx.arguments;

  // カテゴリを小文字に正規化
  const normalizedCategory = category.toLowerCase();

  return {
    operation: 'Query',
    index: 'category-gsi',
    query: {
      expression: 'category = :category',
      expressionValues: {
        ':category': { S: normalizedCategory },
      },
    },
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
