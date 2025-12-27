/**
 * getOrder Pipeline Resolver - After Step
 * stashの全データをマージして返却
 *
 * 返却するデータ構造:
 * - order: Order情報
 * - customer: Customer情報
 * - orderItems: OrderItem配列（各アイテムにproduct情報を含む）
 */

export function request(ctx) {
  // afterステップではリクエストは不要
  return {};
}

export function response(ctx) {
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
