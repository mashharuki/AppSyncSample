/**
 * getProductRanking Pipeline Resolver
 * productRankingsとproductsをマージして最終結果を返す
 */

export function request(_ctx) {
  // Pipeline開始前の準備
  return {};
}

export function response(ctx) {
  const productRankings = ctx.stash.productRankings || [];
  const products = ctx.stash.products || [];

  // データがない場合は空配列を返す
  if (productRankings.length === 0) {
    return [];
  }

  // productIdをキーにしたMapを作成（高速検索のため）
  const productMap = new Map();
  for (const product of products) {
    productMap.set(product.productId, product);
  }

  // productRankingsにproductNameをマージ
  const result = productRankings.map((ranking) => {
    const product = productMap.get(ranking.productId);
    return {
      productId: ranking.productId,
      productName: product?.name || 'Unknown Product',
      totalQuantity: ranking.totalQuantity,
    };
  });

  return result;
}
