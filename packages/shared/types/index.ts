/**
 * Customer entity type
 */
export interface Customer {
  customerId: string;
  name: string;
  email: string;
}

/**
 * Product entity type
 */
export interface Product {
  productId: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

/**
 * Order entity type
 */
export interface Order {
  orderId: string;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
}

/**
 * OrderItem entity type
 */
export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Sales summary analytics type
 */
export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

/**
 * Product ranking analytics type
 */
export interface ProductRanking {
  productId: string;
  productName: string;
  totalQuantity: number;
}

/**
 * Customer statistics analytics type
 */
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
}
