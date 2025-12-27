import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { generateClient } from 'aws-amplify/api';
import CreateOrderForm from './CreateOrderForm';

// Mock Amplify client
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CreateOrderForm', () => {
  const mockGraphQLQuery = vi.fn();
  const mockGraphQLMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (generateClient as any).mockReturnValue({
      graphql: vi.fn((operation) => {
        if (operation.query.includes('listCustomers')) {
          return mockGraphQLQuery(operation);
        }
        if (operation.query.includes('listProducts')) {
          return mockGraphQLQuery(operation);
        }
        if (operation.query.includes('createOrder')) {
          return mockGraphQLMutate(operation);
        }
        return Promise.resolve({ data: null, errors: null });
      }),
    });
  });

  it('should display loading state while fetching customers and products', () => {
    mockGraphQLQuery.mockReturnValue(
      new Promise(() => {}), // Never resolves to keep loading state
    );

    render(<CreateOrderForm />);

    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
  });

  it('should display customer selection dropdown after loading', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listCustomers')) {
        return Promise.resolve({
          data: {
            listCustomers: {
              items: [
                { customerId: 'c1', name: '山田太郎', email: 'yamada@example.com' },
                { customerId: 'c2', name: '佐藤花子', email: 'sato@example.com' },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listProducts: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顧客/i)).toBeInTheDocument();
    });

    const customerSelect = screen.getByLabelText(/顧客/i) as HTMLSelectElement;
    expect(customerSelect.options.length).toBe(3); // Default option + 2 customers
    expect(customerSelect.options[1].textContent).toContain('山田太郎');
    expect(customerSelect.options[2].textContent).toContain('佐藤花子');
  });

  it('should display product selection dropdown after loading', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
                {
                  productId: 'p2',
                  name: 'マウス',
                  category: 'Electronics',
                  price: 2000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listCustomers: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/商品/i)).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    expect(productSelect.options.length).toBe(3); // Default option + 2 products
    expect(productSelect.options[1].textContent).toContain('ノートPC');
    expect(productSelect.options[2].textContent).toContain('マウス');
  });

  it('should display quantity input field', async () => {
    mockGraphQLQuery.mockResolvedValue({
      data: {
        listCustomers: { items: [], nextToken: null },
        listProducts: { items: [], nextToken: null },
      },
      errors: null,
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/数量/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    expect(quantityInput.type).toBe('number');
    expect(quantityInput.min).toBe('1');
  });

  it('should add order item to table when add button is clicked', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listCustomers: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/商品/i)).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '2' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('¥100,000')).toBeInTheDocument();
    expect(screen.getByText('¥200,000')).toBeInTheDocument(); // Subtotal
  });

  it('should calculate and display subtotal for each order item', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 50000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listCustomers: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/商品/i)).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '3' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('¥150,000')).toBeInTheDocument(); // 50000 * 3
    });
  });

  it('should remove order item when delete button is clicked', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listCustomers: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/商品/i)).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('ノートPC')).not.toBeInTheDocument();
    });
  });

  it('should calculate and display total amount', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
                {
                  productId: 'p2',
                  name: 'マウス',
                  category: 'Electronics',
                  price: 2000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listCustomers: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/商品/i)).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    // Add first item
    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '2' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    // Add second item
    fireEvent.change(productSelect, { target: { value: 'p2' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('マウス')).toBeInTheDocument();
    });

    // Check total amount
    await waitFor(() => {
      expect(screen.getByText(/合計金額/i)).toBeInTheDocument();
      expect(screen.getByText(/¥202,000/)).toBeInTheDocument(); // 200000 + 2000
    });
  });

  it('should execute createOrder mutation on form submit', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listCustomers')) {
        return Promise.resolve({
          data: {
            listCustomers: {
              items: [{ customerId: 'c1', name: '山田太郎', email: 'yamada@example.com' }],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({ data: null, errors: null });
    });

    mockGraphQLMutate.mockResolvedValue({
      data: {
        createOrder: {
          orderId: 'o1',
          customerId: 'c1',
          orderDate: '2025-12-27T00:00:00Z',
          totalAmount: 100000,
          status: 'Pending',
        },
      },
      errors: null,
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顧客/i)).toBeInTheDocument();
    });

    const customerSelect = screen.getByLabelText(/顧客/i) as HTMLSelectElement;
    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(customerSelect, { target: { value: 'c1' } });
    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /注文を作成/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGraphQLMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              customerId: 'c1',
              orderItems: [{ productId: 'p1', quantity: 1 }],
            },
          },
        }),
      );
    });
  });

  it('should navigate to order list page on successful creation', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listCustomers')) {
        return Promise.resolve({
          data: {
            listCustomers: {
              items: [{ customerId: 'c1', name: '山田太郎', email: 'yamada@example.com' }],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({ data: null, errors: null });
    });

    mockGraphQLMutate.mockResolvedValue({
      data: {
        createOrder: {
          orderId: 'o1',
          customerId: 'c1',
          orderDate: '2025-12-27T00:00:00Z',
          totalAmount: 100000,
          status: 'Pending',
        },
      },
      errors: null,
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顧客/i)).toBeInTheDocument();
    });

    const customerSelect = screen.getByLabelText(/顧客/i) as HTMLSelectElement;
    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(customerSelect, { target: { value: 'c1' } });
    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /注文を作成/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  });

  it('should display error message on mutation failure', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listCustomers')) {
        return Promise.resolve({
          data: {
            listCustomers: {
              items: [{ customerId: 'c1', name: '山田太郎', email: 'yamada@example.com' }],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      if (operation.query.includes('listProducts')) {
        return Promise.resolve({
          data: {
            listProducts: {
              items: [
                {
                  productId: 'p1',
                  name: 'ノートPC',
                  category: 'Electronics',
                  price: 100000,
                },
              ],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({ data: null, errors: null });
    });

    mockGraphQLMutate.mockResolvedValue({
      data: null,
      errors: [{ message: 'Order creation failed' }],
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顧客/i)).toBeInTheDocument();
    });

    const customerSelect = screen.getByLabelText(/顧客/i) as HTMLSelectElement;
    const productSelect = screen.getByLabelText(/商品/i) as HTMLSelectElement;
    const quantityInput = screen.getByLabelText(/数量/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /追加/i });

    fireEvent.change(customerSelect, { target: { value: 'c1' } });
    fireEvent.change(productSelect, { target: { value: 'p1' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('ノートPC')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /注文を作成/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/注文の作成に失敗しました/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when no customer is selected', async () => {
    mockGraphQLQuery.mockResolvedValue({
      data: {
        listCustomers: { items: [], nextToken: null },
        listProducts: { items: [], nextToken: null },
      },
      errors: null,
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /注文を作成/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /注文を作成/i,
    }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable submit button when order items list is empty', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('listCustomers')) {
        return Promise.resolve({
          data: {
            listCustomers: {
              items: [{ customerId: 'c1', name: '山田太郎', email: 'yamada@example.com' }],
              nextToken: null,
            },
          },
          errors: null,
        });
      }
      return Promise.resolve({
        data: { listProducts: { items: [], nextToken: null } },
        errors: null,
      });
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顧客/i)).toBeInTheDocument();
    });

    const customerSelect = screen.getByLabelText(/顧客/i) as HTMLSelectElement;
    fireEvent.change(customerSelect, { target: { value: 'c1' } });

    const submitButton = screen.getByRole('button', {
      name: /注文を作成/i,
    }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should display order items table headers', async () => {
    mockGraphQLQuery.mockResolvedValue({
      data: {
        listCustomers: { items: [], nextToken: null },
        listProducts: { items: [], nextToken: null },
      },
      errors: null,
    });

    render(<CreateOrderForm />);

    await waitFor(() => {
      expect(screen.getByText('商品名')).toBeInTheDocument();
    });

    const tableHeaders = screen.getAllByText('数量');
    expect(tableHeaders.length).toBeGreaterThan(0);
    expect(screen.getByText('単価')).toBeInTheDocument();
    expect(screen.getByText('小計')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });
});
