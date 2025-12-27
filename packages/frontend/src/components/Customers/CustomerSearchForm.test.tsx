import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generateClient } from 'aws-amplify/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerSearchForm from './CustomerSearchForm';

// Mock Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('CustomerSearchForm', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (generateClient as ReturnType<typeof vi.fn>).mockReturnValue({
      graphql: mockGraphql,
    });
  });

  it('should render search form with email field', () => {
    render(<CustomerSearchForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should validate email format before search', async () => {
    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('should execute searchCustomerByEmail query on submit', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        searchCustomerByEmail: {
          customerId: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockGraphql).toHaveBeenCalledWith({
        query: expect.stringContaining('searchCustomerByEmail'),
        variables: {
          email: 'john@example.com',
        },
      });
    });
  });

  it('should display search results in table format', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        searchCustomerByEmail: {
          customerId: 'customer-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('customer-123')).toBeInTheDocument();
  });

  it('should show "顧客が見つかりません" when no results', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        searchCustomerByEmail: null,
      },
    });

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('顧客が見つかりません')).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    mockGraphql.mockRejectedValue(new Error('Network error'));

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while searching', async () => {
    mockGraphql.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('should disable search button while searching', async () => {
    mockGraphql.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(searchButton).toBeDisabled();
    });
  });

  it('should display table headers in search results', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        searchCustomerByEmail: {
          customerId: 'customer-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    });

    render(<CustomerSearchForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/customer id/i)).toBeInTheDocument();
    });

    // Use getAllByText to find all instances and verify table headers exist
    const nameElements = screen.getAllByText(/name/i);
    expect(nameElements.length).toBeGreaterThan(0);

    const emailElements = screen.getAllByText(/email/i);
    expect(emailElements.length).toBeGreaterThan(0);
  });
});
