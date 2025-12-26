/**
 * createCustomer Mutation Resolver
 * UUID v4でcustomerIdを自動生成し、顧客を作成
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { name, email } = ctx.arguments.input;

  // メールアドレス形式バリデーション
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    util.error('Invalid email format', 'ValidationError');
  }

  // UUID v4を生成
  const customerId = util.autoId();
  const now = util.time.nowISO8601();

  return {
    operation: 'PutItem',
    key: {
      customerId: { S: customerId },
    },
    attributeValues: {
      name: { S: name },
      email: { S: email },
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
