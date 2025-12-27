import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const productRankings = ctx.prev.result || [];

  if (productRankings.length === 0) {
    return {};
  }

  return {
    operation: 'BatchGetItem',
    tables: {
      Products: {
        keys: productRankings.map((ranking) => util.dynamodb.toMapValues({ productId: ranking.productId })),
      },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  const products = ctx.result?.data?.Products || [];
  ctx.stash.products = products;
  return products;
}
