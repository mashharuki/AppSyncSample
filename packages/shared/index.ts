// Export all domain types
export type {
  Customer,
  Product,
  Order,
  OrderItem,
  SalesSummary,
  ProductRanking,
  CustomerStats,
} from './types';

// Export all validators
export { isValidUUID, isValidEmail, isValidPrice } from './types/validators';
