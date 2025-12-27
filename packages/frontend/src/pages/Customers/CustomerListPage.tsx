import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Customer, CustomerConnection } from '../../graphql/generated';

const LIST_CUSTOMERS_QUERY = `
  query ListCustomers($limit: Int, $nextToken: String) {
    listCustomers(limit: $limit, nextToken: $nextToken) {
      items {
        customerId
        name
        email
      }
      nextToken
    }
  }
`;

interface ListCustomersData {
  listCustomers: CustomerConnection;
}

const CustomerListPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);

  const fetchCustomers = async (token: string | null = null) => {
    try {
      setLoading(true);
      setError(null);

      const client = generateClient();
      const response = await client.graphql({
        query: LIST_CUSTOMERS_QUERY,
        variables: {
          limit: 20,
          nextToken: token
        }
      });

      if ('data' in response && response.data) {
        const data = response.data as unknown as ListCustomersData;
        setCustomers(data.listCustomers.items);
        setNextToken(data.listCustomers.nextToken || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleNextPage = () => {
    if (nextToken) {
      fetchCustomers(nextToken);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customers</h1>
      
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        marginTop: '20px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Customer ID
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Name
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No customers found
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.customerId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{customer.customerId}</td>
                <td style={{ padding: '12px' }}>{customer.name}</td>
                <td style={{ padding: '12px' }}>{customer.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {nextToken && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={handleNextPage}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerListPage;
