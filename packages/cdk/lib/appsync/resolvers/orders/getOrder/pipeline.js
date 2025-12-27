/**
 * getOrder Pipeline Resolver - Before and After Handlers
 *
 * Before: Context準備 (orderIdをstashに保存)
 * After: stashの全データをマージして返却
 */

export function request(ctx) {
  // Before step: ctx.argumentsからorderIdを取得し、次のステップに渡す
  return {
    orderId: ctx.arguments.orderId,
  };
}

export function response(ctx) {
  // After step: stashの全データをマージして返却
  const { order, customer, orderItems, products } = ctx.stash;

  // productsを Map に変換して高速アクセス
  const productMap = new Map();
  if (products && products.length > 0) {
    for (const product of products) {
      productMap.set(product.productId, product);
    }
  }

  // OrderItemsに対応するProductを結合
  const enrichedOrderItems = (orderItems || []).map((item) => ({
    ...item,
    product: productMap.get(item.productId) || null,
  }));

  // 最終的な返却データを構築
  return {
    ...order,
    customer: customer || null,
    orderItems: enrichedOrderItems,
  };
}
