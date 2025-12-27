/**
 * getProduct Query Resolver
 * DynamoDB GetItemオペレーションでproductIdをキーに商品を検索
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { productId } = ctx.arguments;

  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ productId }),
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
}
