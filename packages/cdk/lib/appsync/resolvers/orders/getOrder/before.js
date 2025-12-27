/**
 * getOrder Pipeline Resolver - Before Step
 * Context準備: orderIdをstashに保存
 */

export function request(ctx) {
  // ctx.argumentsからorderIdを取得し、stashに保存
  return {
    orderId: ctx.arguments.orderId,
  };
}

export function response(ctx) {
  // beforeステップでは何も返さず、次のステップに進む
  return {};
}
