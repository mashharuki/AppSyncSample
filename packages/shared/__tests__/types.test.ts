import { describe, it, expect } from 'vitest';
import type {
  Customer,
  Product,
  Order,
  OrderItem,
  SalesSummary,
  ProductRanking,
  CustomerStats,
} from '../types';
import { isValidUUID, isValidEmail, isValidPrice } from '../types/validators';

describe('Domain Types', () => {
  describe('Customer Type', () => {
    it('should allow valid customer data', () => {
      const customer: Customer = {
        customerId: '123e4567-e89b-42d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      expect(customer.customerId).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(customer.name).toBe('John Doe');
      expect(customer.email).toBe('john.doe@example.com');
    });
  });

  describe('Product Type', () => {
    it('should allow valid product data', () => {
      const product: Product = {
        productId: '123e4567-e89b-42d3-a456-426614174001',
        name: 'Sample Product',
        category: 'Electronics',
        price: 99.99,
        description: 'A sample product',
      };

      expect(product.productId).toBe('123e4567-e89b-42d3-a456-426614174001');
      expect(product.name).toBe('Sample Product');
      expect(product.category).toBe('Electronics');
      expect(product.price).toBe(99.99);
      expect(product.description).toBe('A sample product');
    });

    it('should allow optional description', () => {
      const product: Product = {
        productId: '123e4567-e89b-42d3-a456-426614174001',
        name: 'Sample Product',
        category: 'Electronics',
        price: 99.99,
      };

      expect(product.description).toBeUndefined();
    });
  });

  describe('Order Type', () => {
    it('should allow valid order data', () => {
      const order: Order = {
        orderId: '123e4567-e89b-42d3-a456-426614174002',
        customerId: '123e4567-e89b-42d3-a456-426614174000',
        orderDate: '2024-01-01T00:00:00Z',
        totalAmount: 199.99,
        status: 'Pending',
      };

      expect(order.orderId).toBe('123e4567-e89b-42d3-a456-426614174002');
      expect(order.customerId).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(order.orderDate).toBe('2024-01-01T00:00:00Z');
      expect(order.totalAmount).toBe(199.99);
      expect(order.status).toBe('Pending');
    });
  });

  describe('OrderItem Type', () => {
    it('should allow valid order item data', () => {
      const orderItem: OrderItem = {
        orderItemId: '123e4567-e89b-42d3-a456-426614174003',
        orderId: '123e4567-e89b-42d3-a456-426614174002',
        productId: '123e4567-e89b-42d3-a456-426614174001',
        quantity: 2,
        unitPrice: 99.99,
      };

      expect(orderItem.orderItemId).toBe('123e4567-e89b-42d3-a456-426614174003');
      expect(orderItem.orderId).toBe('123e4567-e89b-42d3-a456-426614174002');
      expect(orderItem.productId).toBe('123e4567-e89b-42d3-a456-426614174001');
      expect(orderItem.quantity).toBe(2);
      expect(orderItem.unitPrice).toBe(99.99);
    });
  });

  describe('SalesSummary Type', () => {
    it('should allow valid sales summary data', () => {
      const salesSummary: SalesSummary = {
        totalRevenue: 10000.0,
        orderCount: 50,
        averageOrderValue: 200.0,
      };

      expect(salesSummary.totalRevenue).toBe(10000.0);
      expect(salesSummary.orderCount).toBe(50);
      expect(salesSummary.averageOrderValue).toBe(200.0);
    });
  });

  describe('ProductRanking Type', () => {
    it('should allow valid product ranking data', () => {
      const productRanking: ProductRanking = {
        productId: '123e4567-e89b-42d3-a456-426614174001',
        productName: 'Sample Product',
        totalQuantity: 100,
      };

      expect(productRanking.productId).toBe('123e4567-e89b-42d3-a456-426614174001');
      expect(productRanking.productName).toBe('Sample Product');
      expect(productRanking.totalQuantity).toBe(100);
    });
  });

  describe('CustomerStats Type', () => {
    it('should allow valid customer stats data', () => {
      const customerStats: CustomerStats = {
        totalCustomers: 500,
        activeCustomers: 250,
      };

      expect(customerStats.totalCustomers).toBe(500);
      expect(customerStats.activeCustomers).toBe(250);
    });
  });
});

describe('Validator Utilities', () => {
  describe('isValidUUID', () => {
    it('should validate correct UUID v4 format', () => {
      expect(isValidUUID('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-9716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000-extra')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.jp')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('should validate positive numbers', () => {
      expect(isValidPrice(99.99)).toBe(true);
      expect(isValidPrice(0.01)).toBe(true);
      expect(isValidPrice(1000)).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      expect(isValidPrice(0)).toBe(false);
      expect(isValidPrice(-10)).toBe(false);
      expect(isValidPrice(-0.01)).toBe(false);
    });

    it('should reject non-finite numbers', () => {
      expect(isValidPrice(Number.NaN)).toBe(false);
      expect(isValidPrice(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isValidPrice(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });
});
