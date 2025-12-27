/**
 * searchCustomerByEmail Query Resolver
 * DynamoDB GSI Queryオペレーションでemailをキーに顧客を検索
 * メールアドレス形式バリデーションを実行
 */

import { util } from '@aws-appsync/utils';

/**
 * メールアドレス形式の正規表現
 * RFC 5322の簡略版
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function request(ctx) {
  const { email } = ctx.arguments;

  // メールアドレス形式バリデーション
  if (!EMAIL_REGEX.test(email)) {
    return util.error('Invalid email format', 'BadRequest');
  }

  // email-gsiを使用したDynamoDB Queryオペレーション
  return {
    operation: 'Query',
    index: 'email-gsi',
    query: {
      expression: 'email = :email',
      expressionValues: util.dynamodb.toMapValues({
        ':email': email,
      }),
    },
  };
}

export function response(ctx) {
  // GSIクエリ失敗時のエラーハンドリング
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // GSIクエリは複数結果を返す可能性があるが、最初の結果を返す
  // 仕様: メールアドレスは一意性を保証しないが、検索結果として最初のマッチを返す
  const items = ctx.result.items;

  if (!items || items.length === 0) {
    return null;
  }

  return items[0];
}
