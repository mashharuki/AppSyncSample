import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';

const GET_SALES_SUMMARY_QUERY = `
  query GetSalesSummary {
    getSalesSummary {
      totalRevenue
      orderCount
      averageOrderValue
    }
  }
`;

const GET_PRODUCT_RANKING_QUERY = `
  query GetProductRanking($limit: Int) {
    getProductRanking(limit: $limit) {
      productId
      productName
      totalQuantity
    }
  }
`;

const GET_CUSTOMER_STATS_QUERY = `
  query GetCustomerStats {
    getCustomerStats {
      totalCustomers
      activeCustomers
    }
  }
`;

interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

interface ProductRanking {
  productId: string;
  productName: string;
  totalQuantity: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
}

interface GetSalesSummaryData {
  getSalesSummary: SalesSummary;
}

interface GetProductRankingData {
  getProductRanking: ProductRanking[];
}

interface GetCustomerStatsData {
  getCustomerStats: CustomerStats;
}

const DashboardPage = () => {
  // Sales Summary state
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<Error | null>(null);

  // Product Ranking state
  const [productRanking, setProductRanking] = useState<ProductRanking[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState<Error | null>(null);

  // Customer Stats state
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<Error | null>(null);

  // Fetch Sales Summary
  const fetchSalesSummary = async () => {
    try {
      setSalesLoading(true);
      setSalesError(null);

      const client = generateClient();
      const response = await client.graphql<GetSalesSummaryData>({
        query: GET_SALES_SUMMARY_QUERY,
      });

      if ('data' in response) {
        setSalesSummary(response.data.getSalesSummary);
      }
    } catch (err) {
      setSalesError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setSalesLoading(false);
    }
  };

  // Fetch Product Ranking
  const fetchProductRanking = async () => {
    try {
      setRankingLoading(true);
      setRankingError(null);

      const client = generateClient();
      const response = await client.graphql<GetProductRankingData>({
        query: GET_PRODUCT_RANKING_QUERY,
        variables: { limit: 10 },
      });

      if ('data' in response) {
        setProductRanking(response.data.getProductRanking);
      }
    } catch (err) {
      setRankingError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setRankingLoading(false);
    }
  };

  // Fetch Customer Stats
  const fetchCustomerStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const client = generateClient();
      const response = await client.graphql<GetCustomerStatsData>({
        query: GET_CUSTOMER_STATS_QUERY,
      });

      if ('data' in response) {
        setCustomerStats(response.data.getCustomerStats);
      }
    } catch (err) {
      setStatsError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchSalesSummary();
    fetchProductRanking();
    fetchCustomerStats();
  }, []);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard</h1>

      {/* Sales Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {/* Total Revenue Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Total Revenue
          </h3>
          {salesLoading ? (
            <p>Loading sales summary...</p>
          ) : salesError ? (
            <p style={{ color: 'red' }}>{salesError.message}</p>
          ) : (
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {formatCurrency(salesSummary?.totalRevenue || 0)}
            </p>
          )}
        </div>

        {/* Order Count Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Order Count</h3>
          {salesLoading ? (
            <p>Loading sales summary...</p>
          ) : salesError ? (
            <p style={{ color: 'red' }}>{salesError.message}</p>
          ) : (
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {salesSummary?.orderCount || 0}
            </p>
          )}
        </div>

        {/* Average Order Value Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Average Order Value
          </h3>
          {salesLoading ? (
            <p>Loading sales summary...</p>
          ) : salesError ? (
            <p style={{ color: 'red' }}>{salesError.message}</p>
          ) : (
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {formatCurrency(salesSummary?.averageOrderValue || 0)}
            </p>
          )}
        </div>
      </div>

      {/* Product Ranking Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Product Ranking</h2>
        {rankingLoading ? (
          <p>Loading product ranking...</p>
        ) : rankingError ? (
          <p style={{ color: 'red' }}>{rankingError.message}</p>
        ) : !productRanking || productRanking.length === 0 ? (
          <p>No product ranking data available.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th
                  style={{
                    padding: '10px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Rank
                </th>
                <th
                  style={{
                    padding: '10px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Product Name
                </th>
                <th
                  style={{
                    padding: '10px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Sales Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {productRanking.map((product, index) => (
                <tr key={product.productId}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {product.productName}
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #ddd',
                      textAlign: 'right',
                    }}
                  >
                    {product.totalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Total Customers Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Total Customers
          </h3>
          {statsLoading ? (
            <p>Loading customer stats...</p>
          ) : statsError ? (
            <p style={{ color: 'red' }}>{statsError.message}</p>
          ) : (
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {customerStats?.totalCustomers || 0}
            </p>
          )}
        </div>

        {/* Active Customers Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Active Customers
          </h3>
          {statsLoading ? (
            <p>Loading customer stats...</p>
          ) : statsError ? (
            <p style={{ color: 'red' }}>{statsError.message}</p>
          ) : (
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {customerStats?.activeCustomers || 0}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
