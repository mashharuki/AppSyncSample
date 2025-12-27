import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const orderItems = ctx.stash.orderItems || [];

  if (orderItems.length === 0) {
    return {};
  }

  const productIds = orderItems.map((item) => item.productId);
  const uniqueProductIds = [...new Set(productIds)];

  return {
    operation: 'BatchGetItem',
    tables: {
      Products: {
        keys: uniqueProductIds.map((productId) => util.dynamodb.toMapValues({ productId })),
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
