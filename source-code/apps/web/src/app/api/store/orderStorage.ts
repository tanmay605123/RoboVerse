import { StoreOrder } from '@roboverse/shared';

// Global singleton order store for Next.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __ROBOVERSE_ORDERS__: Map<string, StoreOrder> | undefined;
}

if (!global.__ROBOVERSE_ORDERS__) {
  global.__ROBOVERSE_ORDERS__ = new Map<string, StoreOrder>();
}

export const orderStore = global.__ROBOVERSE_ORDERS__;

export function saveOrder(order: StoreOrder): void {
  orderStore.set(order.id, order);
  if (order.razorpayOrderId) {
    orderStore.set(order.razorpayOrderId, order);
  }
}

export function getOrder(idOrRpId: string): StoreOrder | undefined {
  return orderStore.get(idOrRpId);
}

export function getOrdersForUser(userId: string): StoreOrder[] {
  const all = Array.from(new Set(orderStore.values()));
  return all
    .filter((o) => o.userId === userId || userId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
