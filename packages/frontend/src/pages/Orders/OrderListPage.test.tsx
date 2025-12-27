import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { generateClient } from 'aws-amplify/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderListPage from './OrderListPage';

// Mock AWS Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('OrderListPage', () => {
  const mockGraphQLQuery = vi.fn();
  const mockClient = {
    graphql: mockGraphQLQuery,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue(mockClient as any);
  });

  it('should render loading spinner initially', () => {
    // Mock delayed response
    mockGraphQLQuery.mockImplementation(() => new Promise(() => {}));

    render(<OrderListPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display orders in table format', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [
            {
              orderId: 'order-1',
              customerId: 'customer-1',
              orderDate: '2024-01-15T10:30:00Z',
              totalAmount: 299.99,
              status: 'Pending',
              customer: {
                customerId: 'customer-1',
                name: 'John Doe',
                email: 'john@example.com',
                orders: [],
              },
              orderItems: [],
            },
            {
              orderId: 'order-2',
              customerId: 'customer-2',
              orderDate: '2024-01-16T14:20:00Z',
              totalAmount: 150.5,
              status: 'Shipped',
              customer: {
                customerId: 'customer-2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                orders: [],
              },
              orderItems: [],
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(screen.getByText('order-1')).toBeInTheDocument();
    });

    expect(screen.getByText('order-2')).toBeInTheDocument();
    expect(screen.getByText('customer-1')).toBeInTheDocument();
    expect(screen.getByText('customer-2')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15T10:30:00Z')).toBeInTheDocument();
    expect(screen.getByText('2024-01-16T14:20:00Z')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('$150.50')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
  });

  it('should display error message when query fails', async () => {
    const mockError = new Error('Failed to fetch orders');
    mockGraphQLQuery.mockRejectedValueOnce(mockError);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to fetch orders/i)).toBeInTheDocument();
  });

  it('should implement pagination with nextToken', async () => {
    const mockFirstPage = {
      data: {
        listOrders: {
          items: [
            {
              orderId: 'order-1',
              customerId: 'customer-1',
              orderDate: '2024-01-15T10:30:00Z',
              totalAmount: 299.99,
              status: 'Pending',
              customer: {
                customerId: 'customer-1',
                name: 'John Doe',
                email: 'john@example.com',
                orders: [],
              },
              orderItems: [],
            },
          ],
          nextToken: 'token-page-2',
        },
      },
    };

    const mockSecondPage = {
      data: {
        listOrders: {
          items: [
            {
              orderId: 'order-2',
              customerId: 'customer-2',
              orderDate: '2024-01-16T14:20:00Z',
              totalAmount: 150.5,
              status: 'Shipped',
              customer: {
                customerId: 'customer-2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                orders: [],
              },
              orderItems: [],
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockFirstPage).mockResolvedValueOnce(mockSecondPage);

    render(<OrderListPage />);

    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('order-1')).toBeInTheDocument();
    });

    // Click next page button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();

    await userEvent.click(nextButton);

    // Wait for second page
    await waitFor(() => {
      expect(screen.getByText('order-2')).toBeInTheDocument();
    });
  });

  it('should hide next button when no nextToken', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [
            {
              orderId: 'order-1',
              customerId: 'customer-1',
              orderDate: '2024-01-15T10:30:00Z',
              totalAmount: 299.99,
              status: 'Pending',
              customer: {
                customerId: 'customer-1',
                name: 'John Doe',
                email: 'john@example.com',
                orders: [],
              },
              orderItems: [],
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(screen.getByText('order-1')).toBeInTheDocument();
    });

    const nextButton = screen.queryByRole('button', { name: /next/i });
    expect(nextButton).not.toBeInTheDocument();
  });

  it('should use limit of 20 for pagination', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(mockGraphQLQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            limit: 20,
          }),
        }),
      );
    });
  });

  it('should display table headers', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(screen.getByText(/order id/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/customer id/i)).toBeInTheDocument();
    expect(screen.getByText(/order date/i)).toBeInTheDocument();
    expect(screen.getByText(/total amount/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it('should display detail buttons for each order', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [
            {
              orderId: 'order-1',
              customerId: 'customer-1',
              orderDate: '2024-01-15T10:30:00Z',
              totalAmount: 299.99,
              status: 'Pending',
              customer: {
                customerId: 'customer-1',
                name: 'John Doe',
                email: 'john@example.com',
                orders: [],
              },
              orderItems: [],
            },
            {
              orderId: 'order-2',
              customerId: 'customer-2',
              orderDate: '2024-01-16T14:20:00Z',
              totalAmount: 150.5,
              status: 'Shipped',
              customer: {
                customerId: 'customer-2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                orders: [],
              },
              orderItems: [],
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      const detailButtons = screen.getAllByRole('button', { name: /詳細/i });
      expect(detailButtons).toHaveLength(2);
    });
  });

  it('should display "No orders found" when list is empty', async () => {
    const mockOrders = {
      data: {
        listOrders: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockOrders);

    render(<OrderListPage />);

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });
});
