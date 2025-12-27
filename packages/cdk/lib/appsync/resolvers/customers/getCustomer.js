/**
 * getCustomer Query Resolver
 * DynamoDB GetItemオペレーションでcustomerIdをキーに顧客を検索
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { customerId } = ctx.arguments;

  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ customerId }),
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
}
