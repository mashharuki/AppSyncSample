import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import DashboardPage from './DashboardPage';

// Mock aws-amplify/api
vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(),
}));

describe('DashboardPage', () => {
  const mockGraphQLQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (generateClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      graphql: mockGraphQLQuery,
    });
  });

  it('should render loading spinners initially', () => {
    // Mock delayed responses
    mockGraphQLQuery.mockReturnValue(new Promise(() => {})); // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional for loading state test

    render(<DashboardPage />);

    // Should show loading text for all sections
    expect(screen.getAllByText(/Loading sales summary/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Loading product ranking/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Loading customer stats/i).length).toBeGreaterThan(0);
  });

  it('should display sales summary data', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: {
              totalRevenue: 15000.5,
              orderCount: 25,
              averageOrderValue: 600.02,
            },
          },
        });
      }
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({ data: { getProductRanking: [] } });
      }
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: { getCustomerStats: { totalCustomers: 0, activeCustomers: 0 } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
      expect(screen.getByText('$15,000.50')).toBeInTheDocument();
      expect(screen.getByText(/Order Count/i)).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText(/Average Order Value/i)).toBeInTheDocument();
      expect(screen.getByText('$600.02')).toBeInTheDocument();
    });
  });

  it('should display product ranking data', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({
          data: {
            getProductRanking: [
              { productId: '1', productName: 'Laptop', totalQuantity: 50 },
              { productId: '2', productName: 'Mouse', totalQuantity: 120 },
              { productId: '3', productName: 'Keyboard', totalQuantity: 80 },
            ],
          },
        });
      }
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 },
          },
        });
      }
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: { getCustomerStats: { totalCustomers: 0, activeCustomers: 0 } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Product Ranking/i)).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
    });
  });

  it('should display customer stats data', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: {
            getCustomerStats: {
              totalCustomers: 150,
              activeCustomers: 45,
            },
          },
        });
      }
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 },
          },
        });
      }
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({ data: { getProductRanking: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Total Customers/i)).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText(/Active Customers/i)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('should handle sales summary error', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getSalesSummary')) {
        return Promise.reject(new Error('Failed to fetch sales summary'));
      }
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({ data: { getProductRanking: [] } });
      }
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: { getCustomerStats: { totalCustomers: 0, activeCustomers: 0 } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to fetch sales summary/i).length).toBeGreaterThan(0);
    });
  });

  it('should handle product ranking error', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getProductRanking')) {
        return Promise.reject(new Error('Failed to fetch product ranking'));
      }
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 },
          },
        });
      }
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: { getCustomerStats: { totalCustomers: 0, activeCustomers: 0 } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch product ranking/i)).toBeInTheDocument();
    });
  });

  it('should handle customer stats error', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getCustomerStats')) {
        return Promise.reject(new Error('Failed to fetch customer stats'));
      }
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 },
          },
        });
      }
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({ data: { getProductRanking: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to fetch customer stats/i).length).toBeGreaterThan(0);
    });
  });

  it('should display empty state when no data is available', async () => {
    mockGraphQLQuery.mockImplementation((operation) => {
      if (operation.query.includes('getSalesSummary')) {
        return Promise.resolve({
          data: {
            getSalesSummary: {
              totalRevenue: 0,
              orderCount: 0,
              averageOrderValue: 0,
            },
          },
        });
      }
      if (operation.query.includes('getProductRanking')) {
        return Promise.resolve({
          data: {
            getProductRanking: [],
          },
        });
      }
      if (operation.query.includes('getCustomerStats')) {
        return Promise.resolve({
          data: {
            getCustomerStats: {
              totalCustomers: 0,
              activeCustomers: 0,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0);
      expect(screen.getByText(/No product ranking data/i)).toBeInTheDocument();
    });
  });

  it('should fetch all data on mount', async () => {
    mockGraphQLQuery.mockResolvedValue({
      data: {
        getSalesSummary: { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 },
        getProductRanking: [],
        getCustomerStats: { totalCustomers: 0, activeCustomers: 0 },
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockGraphQLQuery).toHaveBeenCalledTimes(3);
    });
  });
});
