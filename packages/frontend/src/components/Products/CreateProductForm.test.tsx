import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generateClient } from 'aws-amplify/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateProductForm from './CreateProductForm';

// Mock Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('CreateProductForm', () => {
  const mockGraphql = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (generateClient as ReturnType<typeof vi.fn>).mockReturnValue({
      graphql: mockGraphql,
    });
  });

  it('should render form fields for product creation', () => {
    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
  });

  it('should render category dropdown with predefined options', () => {
    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toBeInTheDocument();
    expect(categorySelect.tagName).toBe('SELECT');

    // Check for category options
    const options = screen.getAllByRole('option');
    const categoryTexts = options.map((option) => option.textContent);

    expect(categoryTexts).toContain('Electronics');
    expect(categoryTexts).toContain('Clothing');
    expect(categoryTexts).toContain('Books');
  });

  it('should validate price as positive number', async () => {
    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '-10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/price must be a positive number/i)).toBeInTheDocument();
    });

    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('should validate price as zero is invalid', async () => {
    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/price must be a positive number/i)).toBeInTheDocument();
    });

    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('should accept valid positive price', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createProduct: {
          productId: '123',
          name: 'Test Product',
          category: 'Electronics',
          price: 99.99,
          description: 'Test description',
        },
      },
    });

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGraphql).toHaveBeenCalled();
    });

    // Should not show validation error
    expect(screen.queryByText(/price must be a positive number/i)).not.toBeInTheDocument();
  });

  it('should call createProduct mutation on submit', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createProduct: {
          productId: '123',
          name: 'Laptop',
          category: 'Electronics',
          price: 999.99,
          description: 'High-performance laptop',
        },
      },
    });

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.change(descriptionInput, { target: { value: 'High-performance laptop' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGraphql).toHaveBeenCalledWith({
        query: expect.stringContaining('createProduct'),
        variables: {
          input: {
            name: 'Laptop',
            category: 'Electronics',
            price: 999.99,
            description: 'High-performance laptop',
          },
        },
      });
    });
  });

  it('should reset form on success', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createProduct: {
          productId: '123',
          name: 'Laptop',
          category: 'Electronics',
          price: 999.99,
          description: 'High-performance laptop',
        },
      },
    });

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.change(descriptionInput, { target: { value: 'High-performance laptop' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(categorySelect.value).toBe('');
      expect(priceInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });
  });

  it('should call onSuccess callback after successful creation', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createProduct: {
          productId: '123',
          name: 'Laptop',
          category: 'Electronics',
          price: 999.99,
          description: 'High-performance laptop',
        },
      },
    });

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.change(descriptionInput, { target: { value: 'High-performance laptop' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on failure', async () => {
    mockGraphql.mockRejectedValue(new Error('Network error'));

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.change(descriptionInput, { target: { value: 'High-performance laptop' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should disable submit button while submitting', async () => {
    mockGraphql.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should handle optional description field', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createProduct: {
          productId: '123',
          name: 'Laptop',
          category: 'Electronics',
          price: 999.99,
          description: undefined,
        },
      },
    });

    render(<CreateProductForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /create product/i });

    // Don't fill in description
    fireEvent.change(nameInput, { target: { value: 'Laptop' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(priceInput, { target: { value: '999.99' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGraphql).toHaveBeenCalledWith({
        query: expect.stringContaining('createProduct'),
        variables: {
          input: {
            name: 'Laptop',
            category: 'Electronics',
            price: 999.99,
            description: undefined,
          },
        },
      });
    });
  });
});
