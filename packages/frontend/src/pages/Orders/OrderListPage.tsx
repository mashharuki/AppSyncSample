import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import type { Order, OrderConnection } from '../../graphql/generated';

const LIST_ORDERS_QUERY = `
  query ListOrders($limit: Int, $nextToken: String) {
    listOrders(limit: $limit, nextToken: $nextToken) {
      items {
        orderId
        customerId
        orderDate
        totalAmount
        status
      }
      nextToken
    }
  }
`;

interface ListOrdersData {
  listOrders: OrderConnection;
}

const OrderListPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);

  const fetchOrders = async (token: string | null = null) => {
    try {
      setLoading(true);
      setError(null);

      const client = generateClient();
      const response = await client.graphql({
        query: LIST_ORDERS_QUERY,
        variables: {
          limit: 20,
          nextToken: token,
        },
      });

      if ('data' in response && response.data) {
        const data = response.data as unknown as ListOrdersData;
        setOrders(data.listOrders.items);
        setNextToken(data.listOrders.nextToken || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleNextPage = () => {
    if (nextToken) {
      fetchOrders(nextToken);
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
      <h1>Orders</h1>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Order ID
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Customer ID
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Order Date
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Total Amount
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Status
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.orderId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{order.orderId}</td>
                <td style={{ padding: '12px' }}>{order.customerId}</td>
                <td style={{ padding: '12px' }}>{order.orderDate}</td>
                <td style={{ padding: '12px' }}>${order.totalAmount.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>{order.status}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    詳細
                  </button>
                </td>
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
              fontSize: '16px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;
