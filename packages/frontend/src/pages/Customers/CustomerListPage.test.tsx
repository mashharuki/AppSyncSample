import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import CustomerListPage from './CustomerListPage';
import { generateClient } from 'aws-amplify/api';

// Mock AWS Amplify
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn()
}));

describe('CustomerListPage', () => {
  const mockGraphQLQuery = vi.fn();
  const mockClient = {
    graphql: mockGraphQLQuery
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue(mockClient as any);
  });

  it('should render loading spinner initially', () => {
    // Mock delayed response
    mockGraphQLQuery.mockImplementation(() => new Promise(() => {}));
    
    render(<CustomerListPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display customers in table format', async () => {
    const mockCustomers = {
      data: {
        listCustomers: {
          items: [
            {
              customerId: 'customer-1',
              name: 'John Doe',
              email: 'john@example.com',
              orders: []
            },
            {
              customerId: 'customer-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              orders: []
            }
          ],
          nextToken: null
        }
      }
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockCustomers);
    
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('customer-1')).toBeInTheDocument();
    expect(screen.getByText('customer-2')).toBeInTheDocument();
  });

  it('should display error message when query fails', async () => {
    const mockError = new Error('Failed to fetch customers');
    mockGraphQLQuery.mockRejectedValueOnce(mockError);
    
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch customers/i)).toBeInTheDocument();
  });

  it('should implement pagination with nextToken', async () => {
    const mockFirstPage = {
      data: {
        listCustomers: {
          items: [
            {
              customerId: 'customer-1',
              name: 'Customer 1',
              email: 'customer1@example.com',
              orders: []
            }
          ],
          nextToken: 'token-page-2'
        }
      }
    };

    const mockSecondPage = {
      data: {
        listCustomers: {
          items: [
            {
              customerId: 'customer-2',
              name: 'Customer 2',
              email: 'customer2@example.com',
              orders: []
            }
          ],
          nextToken: null
        }
      }
    };

    mockGraphQLQuery
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);
    
    render(<CustomerListPage />);
    
    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
    });
    
    // Click next page button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    
    await userEvent.click(nextButton);
    
    // Wait for second page
    await waitFor(() => {
      expect(screen.getByText('Customer 2')).toBeInTheDocument();
    });
  });

  it('should hide next button when no nextToken', async () => {
    const mockCustomers = {
      data: {
        listCustomers: {
          items: [
            {
              customerId: 'customer-1',
              name: 'John Doe',
              email: 'john@example.com',
              orders: []
            }
          ],
          nextToken: null
        }
      }
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockCustomers);
    
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const nextButton = screen.queryByRole('button', { name: /next/i });
    expect(nextButton).not.toBeInTheDocument();
  });

  it('should use limit of 20 for pagination', async () => {
    const mockCustomers = {
      data: {
        listCustomers: {
          items: [],
          nextToken: null
        }
      }
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockCustomers);
    
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(mockGraphQLQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            limit: 20
          })
        })
      );
    });
  });

  it('should display table headers', async () => {
    const mockCustomers = {
      data: {
        listCustomers: {
          items: [],
          nextToken: null
        }
      }
    };

    mockGraphQLQuery.mockResolvedValueOnce(mockCustomers);
    
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/customer id/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
  });
});
