import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { generateClient } from 'aws-amplify/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductListPage from './ProductListPage';

// Mock AWS Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('ProductListPage', () => {
  const mockGraphQLQuery = vi.fn();
  const mockClient = {
    graphql: mockGraphQLQuery,
  };

  beforeEach(() => {
    mockGraphQLQuery.mockReset();
    vi.mocked(generateClient).mockReturnValue(mockClient as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render loading spinner initially', () => {
    // Mock delayed response
    mockGraphQLQuery.mockImplementation(() => new Promise(() => {}));

    render(<ProductListPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display products in card format', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [
            {
              productId: 'product-1',
              name: 'Laptop',
              category: 'Electronics',
              price: 999.99,
              description: 'High-performance laptop',
            },
            {
              productId: 'product-2',
              name: 'T-Shirt',
              category: 'Clothing',
              price: 19.99,
              description: 'Cotton t-shirt',
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    // Use getAllByText for text that appears multiple times (in dropdown and cards)
    expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clothing').length).toBeGreaterThan(0);
    expect(screen.getByText('$999.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('High-performance laptop')).toBeInTheDocument();
    expect(screen.getByText('Cotton t-shirt')).toBeInTheDocument();
  });

  it('should display error message when query fails', async () => {
    const mockError = new Error('Failed to fetch products');
    mockGraphQLQuery.mockRejectedValueOnce(mockError);

    render(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to fetch products/i)).toBeInTheDocument();
  });

  it('should implement pagination with nextToken', async () => {
    const mockFirstPage = {
      data: {
        listProducts: {
          items: [
            {
              productId: 'product-1',
              name: 'Product 1',
              category: 'Electronics',
              price: 100.0,
              description: 'First product',
            },
          ],
          nextToken: 'token-page-2',
        },
      },
    };

    const mockSecondPage = {
      data: {
        listProducts: {
          items: [
            {
              productId: 'product-2',
              name: 'Product 2',
              category: 'Books',
              price: 20.0,
              description: 'Second product',
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockFirstPage).mockResolvedValueOnce(mockSecondPage);

    render(<ProductListPage />);

    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Click next page button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();

    await userEvent.click(nextButton);

    // Wait for second page
    await waitFor(() => {
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('should hide next button when no nextToken', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [
            {
              productId: 'product-1',
              name: 'Laptop',
              category: 'Electronics',
              price: 999.99,
              description: 'High-performance laptop',
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const nextButton = screen.queryByRole('button', { name: /next/i });
    expect(nextButton).not.toBeInTheDocument();
  });

  it('should use limit of 20 for pagination', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

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

  it('should display category filter dropdown', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

    await waitFor(() => {
      const categoryFilter = screen.getByRole('combobox', { name: /category/i });
      expect(categoryFilter).toBeInTheDocument();
    });
  });

  it('should filter products by category when category selected', async () => {
    const mockAllProducts = {
      data: {
        listProducts: {
          items: [
            {
              productId: 'product-1',
              name: 'Laptop',
              category: 'Electronics',
              price: 999.99,
              description: 'High-performance laptop',
            },
          ],
          nextToken: null,
        },
      },
    };

    const mockFilteredProducts = {
      data: {
        listProductsByCategory: {
          items: [
            {
              productId: 'product-2',
              name: 'Phone',
              category: 'Electronics',
              price: 599.99,
              description: 'Smartphone',
            },
          ],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery
      .mockResolvedValueOnce(mockAllProducts)
      .mockResolvedValueOnce(mockFilteredProducts);

    render(<ProductListPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    // Select Electronics category
    const categoryFilter = screen.getByRole('combobox', { name: /category/i });
    await userEvent.selectOptions(categoryFilter, 'Electronics');

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });

    expect(mockGraphQLQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          category: 'Electronics',
          limit: 20,
        }),
      }),
    );
  });

  it('should use listProducts query when category filter is empty', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

    await waitFor(() => {
      expect(mockGraphQLQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('listProducts'),
          variables: expect.objectContaining({
            limit: 20,
          }),
        }),
      );
    });

    // Verify it did NOT call listProductsByCategory
    expect(mockGraphQLQuery).not.toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('listProductsByCategory'),
      }),
    );
  });

  it('should display empty state when no products found', async () => {
    const mockProducts = {
      data: {
        listProducts: {
          items: [],
          nextToken: null,
        },
      },
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockProducts);

    render(<ProductListPage />);

    await waitFor(() => {
      // Wait for loading to finish first
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
