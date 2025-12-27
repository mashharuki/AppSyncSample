/**
 * getProductRanking Function 2: BatchGetProducts
 * ProductsテーブルからBatchGetItemで商品詳細を取得
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const productRankings = ctx.prev.result || [];

  // データがない場合は空のBatchGetItemリクエストを返す
  if (productRankings.length === 0) {
    return {
      operation: 'BatchGetItem',
      tables: {
        Products: {
          keys: [],
        },
      },
    };
  }

  // productIdリストからBatchGetItemキーを作成
  const keys = productRankings.map((ranking) => ({
    productId: ranking.productId,
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

  const products = ctx.result?.data?.Products || [];

  // 次のステップ（pipeline.js）のためにstashに保存
  ctx.stash.products = products;

  return products;
}
