import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generateClient } from 'aws-amplify/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateCustomerForm from './CreateCustomerForm';

// Mock Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('CreateCustomerForm', () => {
  const mockGraphql = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (generateClient as ReturnType<typeof vi.fn>).mockReturnValue({
      graphql: mockGraphql,
    });
  });

  it('should render form fields', () => {
    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create customer/i })).toBeInTheDocument();
  });

  it('should validate email format on client side', async () => {
    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('should accept valid email format', async () => {
    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    expect(submitButton).not.toBeDisabled();

    // Should not show validation error
    expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
  });

  it('should call createCustomer mutation on submit', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createCustomer: {
          customerId: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGraphql).toHaveBeenCalledWith({
        query: expect.stringContaining('createCustomer'),
        variables: {
          input: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      });
    });
  });

  it('should reset form on success', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createCustomer: {
          customerId: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  it('should call onSuccess callback after successful creation', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        createCustomer: {
          customerId: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on failure', async () => {
    mockGraphql.mockRejectedValue(new Error('Network error'));

    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should disable submit button while submitting', async () => {
    mockGraphql.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<CreateCustomerForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
