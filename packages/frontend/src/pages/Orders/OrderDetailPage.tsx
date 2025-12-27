import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Order } from '../../graphql/generated';

const GET_ORDER_QUERY = `
  query GetOrder($orderId: ID!) {
    getOrder(orderId: $orderId) {
      orderId
      customerId
      orderDate
      totalAmount
      status
      customer {
        customerId
        name
        email
      }
      orderItems {
        orderItemId
        orderId
        productId
        quantity
        unitPrice
        product {
          productId
          name
          category
          price
          description
        }
      }
    }
  }
`;

interface GetOrderData {
  getOrder: Order | null;
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError(new Error('Order ID is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const client = generateClient();
        const response = await client.graphql({
          query: GET_ORDER_QUERY,
          variables: {
            orderId,
          },
        });

        if ('data' in response && response.data) {
          const data = response.data as unknown as GetOrderData;
          setOrder(data.getOrder);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch order details'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleBack = () => {
    window.history.back();
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
        <button
          onClick={handleBack}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Order not found</p>
        <button
          onClick={handleBack}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Order Details</h1>

      {/* Customer Information Section */}
      <div style={{ marginTop: '30px' }}>
        <h2>Customer Information</h2>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            marginTop: '10px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <strong>Name:</strong> {order.customer.name}
          </div>
          <div>
            <strong>Email:</strong> {order.customer.email}
          </div>
        </div>
      </div>

      {/* Order Information Section */}
      <div style={{ marginTop: '30px' }}>
        <h2>Order Information</h2>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            marginTop: '10px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <strong>Order ID:</strong> {order.orderId}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Order Date:</strong> {order.orderDate}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
          </div>
          <div>
            <strong>Status:</strong> {order.status}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div style={{ marginTop: '30px' }}>
        <h2>Order Items</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Product Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Quantity
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Unit Price
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No order items
                </td>
              </tr>
            ) : (
              order.orderItems.map((item) => {
                const subtotal = item.quantity * item.unitPrice;
                return (
                  <tr key={item.orderItemId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{item.product.name}</td>
                    <td style={{ padding: '12px' }}>{item.quantity}</td>
                    <td style={{ padding: '12px' }}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>${subtotal.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;
