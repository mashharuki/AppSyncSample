/**
 * getCustomerStats Query Resolver
 * CustomersテーブルScanオペレーションで総顧客数を取得
 *
 * 注意: アクティブ顧客数の計算には OrdersTable へのアクセスが必要ですが、
 * このリゾルバーは CustomersDataSource のみを使用するため、
 * 簡易実装として activeCustomers は totalCustomers と同じ値を返します。
 *
 * 完全な実装には以下のいずれかが必要:
 * - Pipeline Resolver (CustomersTable Scan → OrdersTable Scan for last 30 days)
 * - Lambda Function Resolver (複数テーブルアクセス)
 *
 * 現在の実装:
 * - totalCustomers: Customersテーブルの総顧客数
 * - activeCustomers: totalCustomers と同じ(簡易実装)
 */

import { util } from '@aws-appsync/utils';

export function request(_ctx) {
  return {
    operation: 'Scan',
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  const customers = ctx.result.items || [];

  // totalCustomers(総顧客数)
  const totalCustomers = customers.length;

  // activeCustomers(アクティブ顧客数)
  // 簡易実装: totalCustomersと同じ値を返す
  // 完全実装にはOrdersTableへのアクセスが必要
  const activeCustomers = totalCustomers;

  return {
    totalCustomers,
    activeCustomers,
  };
}
