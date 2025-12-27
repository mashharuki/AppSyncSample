/**
 * createOrder Mutation Resolver
 * 
 * 機能:
 * - UUID v4でorderIdを自動生成
 * - ISO 8601形式で作成日時を記録
 * - 注文をOrdersテーブルに保存
 * 
 * 実装制約:
 * APPSYNC_JSランタイムでは単一のDynamoDB操作のみサポートされるため、
 * タスク6.2で要求される以下の機能は簡略化実装:
 * 
 * 1. customerId存在チェック (CustomersテーブルGetItem)
 * 2. productId存在チェック (ProductsテーブルBatchGetItem)
 * 3. 商品価格取得とtotalAmount計算
 * 4. OrderItemsテーブルへのBatchWriteItem
 * 
 * 完全な実装には以下のいずれかが必要:
 * - Pipeline Resolver (複数Functionステップで実装)
 * - Lambda Function Resolver (すべてのロジックをLambdaで実装)
 * - Step Functions + EventBridge (非同期処理)
 * 
 * 現在の簡略実装では:
 * - Ordersテーブルへの基本的な注文作成のみ実行
 * - totalAmountは入力から計算せず0で初期化
 * - OrderItemsは別途作成が必要
 * 
 * タスク6.3 (Pipeline Resolver実装) で完全な実装を予定
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { customerId, orderItems } = ctx.arguments.input;

  // 入力バリデーション: 注文アイテムが存在するか
  if (!orderItems || orderItems.length === 0) {
    util.error('Order must contain at least one item', 'ValidationError');
  }

  // 入力バリデーション: 各注文アイテムの数量が正の整数か
  for (const item of orderItems) {
    if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      util.error(`Invalid quantity for product ${item.productId}: must be a positive integer`, 'ValidationError');
    }
  }

  // UUID v4を自動生成
  const orderId = util.autoId();
  const now = util.time.nowISO8601();

  // Ordersテーブルに注文を作成
  // Note: totalAmountは簡略実装のため0で初期化
  // 完全な実装ではProductsテーブルから価格を取得して計算する必要あり
  return {
    operation: 'PutItem',
    key: {
      orderId: { S: orderId },
    },
    attributeValues: {
      customerId: { S: customerId },
      orderDate: { S: now },
      totalAmount: { N: '0' },
      status: { S: 'Pending' },
      createdAt: { S: now },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // DynamoDB PutItemの結果を返却
  return ctx.result;
}
