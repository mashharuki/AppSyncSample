import { render, screen, waitFor } from '@testing-library/react';
import { generateClient } from 'aws-amplify/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderDetailPage from './OrderDetailPage';

// Mock AWS Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

// Mock useParams to simulate route parameter
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

import { useParams } from 'react-router-dom';

describe('OrderDetailPage', () => {
  const mockGraphQLQuery = vi.fn();
  const mockClient = {
    graphql: mockGraphQLQuery,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue(mockClient as any);
    vi.mocked(useParams).mockReturnValue({ orderId: 'order-123' });
  });

  it('should render loading skeleton initially', () => {
    // Mock delayed response
    mockGraphQLQuery.mockImplementation(() => new Promise(() => {}));

    render(<OrderDetailPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display customer information section', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display order information section', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('order-123')).toBeInTheDocument();
    });

    expect(screen.getByText('2024-01-15T10:30:00Z')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should display order items table with product details', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [
            {
              orderItemId: 'item-1',
              orderId: 'order-123',
              productId: 'product-1',
              quantity: 2,
              unitPrice: 49.99,
              product: {
                productId: 'product-1',
                name: 'Widget A',
                category: 'Electronics',
                price: 49.99,
                description: 'A great widget',
              },
            },
            {
              orderItemId: 'item-2',
              orderId: 'order-123',
              productId: 'product-2',
              quantity: 1,
              unitPrice: 200.01,
              product: {
                productId: 'product-2',
                name: 'Gadget B',
                category: 'Electronics',
                price: 200.01,
                description: 'An amazing gadget',
              },
            },
          ],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    expect(screen.getByText('Gadget B')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
    expect(screen.getByText('1')).toBeInTheDocument(); // quantity
    expect(screen.getByText('$49.99')).toBeInTheDocument(); // unitPrice
    
    // $200.01 appears twice (unitPrice and subtotal for item-2), so use getAllByText
    const price200Elements = screen.getAllByText('$200.01');
    expect(price200Elements).toHaveLength(2); // unitPrice and subtotal
    
    expect(screen.getByText('$99.98')).toBeInTheDocument(); // subtotal for item-1 (2 * 49.99)
  });

  it('should calculate and display subtotals correctly', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [
            {
              orderItemId: 'item-1',
              orderId: 'order-123',
              productId: 'product-1',
              quantity: 3,
              unitPrice: 25.5,
              product: {
                productId: 'product-1',
                name: 'Product A',
                category: 'Electronics',
                price: 25.5,
              },
            },
          ],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      // 3 * 25.5 = 76.50
      expect(screen.getByText('$76.50')).toBeInTheDocument();
    });
  });

  it('should display error message and back button when query fails', async () => {
    const mockError = new Error('Failed to fetch order details');
    mockGraphQLQuery.mockRejectedValueOnce(mockError);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to fetch order details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('should display error when orderId is missing from route params', async () => {
    vi.mocked(useParams).mockReturnValue({});

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/order id is required/i)).toBeInTheDocument();
  });

  it('should use getOrder query with orderId from route params', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(mockGraphQLQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            orderId: 'order-123',
          }),
        }),
      );
    });
  });

  it('should display table headers for order items', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 299.99,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/product name/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/unit price/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  });

  it('should display "No order items" when orderItems array is empty', async () => {
    const mockOrderData = {
      data: {
        getOrder: {
          orderId: 'order-123',
          customerId: 'customer-456',
          orderDate: '2024-01-15T10:30:00Z',
          totalAmount: 0,
          status: 'Pending',
          customer: {
            customerId: 'customer-456',
            name: 'John Doe',
            email: 'john@example.com',
            orders: [],
          },
          orderItems: [],
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrderData);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/no order items/i)).toBeInTheDocument();
    });
  });
});
