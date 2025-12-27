import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';

interface Customer {
  customerId: string;
  name: string;
  email: string;
}

interface Product {
  productId: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
}

const listCustomersQuery = `
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

const listProductsQuery = `
  query ListProducts($limit: Int, $nextToken: String) {
    listProducts(limit: $limit, nextToken: $nextToken) {
      items {
        productId
        name
        category
        price
        description
      }
      nextToken
    }
  }
`;

const createOrderMutation = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      orderId
      customerId
      orderDate
      totalAmount
      status
    }
  }
`;

const CreateOrderForm = () => {
  const navigate = useNavigate();
  const client = generateClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          client.graphql({
            query: listCustomersQuery,
            variables: { limit: 100 },
          }),
          client.graphql({
            query: listProductsQuery,
            variables: { limit: 100 },
          }),
        ]);

        if ('data' in customersResponse && customersResponse.data.listCustomers) {
          setCustomers(customersResponse.data.listCustomers.items || []);
        }

        if ('data' in productsResponse && productsResponse.data.listProducts) {
          setProducts(productsResponse.data.listProducts.items || []);
        }

        setLoading(false);
      } catch (err) {
        setError('データの読み込みに失敗しました');
        setLoading(false);
      }
    };

    fetchData();
  }, [client]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      return;
    }

    const product = products.find((p) => p.productId === selectedProductId);
    if (!product) {
      return;
    }

    const newItem: OrderItem = {
      productId: product.productId,
      quantity,
      unitPrice: product.price,
      productName: product.name,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = (item: OrderItem) => {
    return item.quantity * item.unitPrice;
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + calculateSubtotal(item), 0);
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('ja-JP')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId || orderItems.length === 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await client.graphql({
        query: createOrderMutation,
        variables: {
          input: {
            customerId: selectedCustomerId,
            orderItems: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      });

      if ('errors' in response && response.errors) {
        setError('注文の作成に失敗しました');
        setSubmitting(false);
        return;
      }

      navigate('/orders');
    } catch (err) {
      setError('注文の作成に失敗しました');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>注文作成</h2>

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="customer-select" style={{ display: 'block', marginBottom: '8px' }}>
            顧客
          </label>
          <select
            id="customer-select"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="">顧客を選択してください</option>
            {customers.map((customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>注文明細を追加</h3>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="product-select" style={{ display: 'block', marginBottom: '8px' }}>
              商品
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="">商品を選択してください</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.name} - {formatCurrency(product.price)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="quantity-input" style={{ display: 'block', marginBottom: '8px' }}>
              数量
            </label>
            <input
              id="quantity-input"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            disabled={!selectedProductId}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedProductId ? '#2196f3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedProductId ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            追加
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>注文明細</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  商品名
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  数量
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  単価
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  小計
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666',
                    }}
                  >
                    注文明細がありません
                  </td>
                </tr>
              ) : (
                orderItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {item.productName}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(calculateSubtotal(item))}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            textAlign: 'right',
          }}
        >
          <strong style={{ fontSize: '18px' }}>合計金額: {formatCurrency(calculateTotal())}</strong>
        </div>

        <button
          type="submit"
          disabled={!selectedCustomerId || orderItems.length === 0 || submitting}
          style={{
            padding: '12px 24px',
            backgroundColor:
              selectedCustomerId && orderItems.length > 0 && !submitting ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor:
              selectedCustomerId && orderItems.length > 0 && !submitting
                ? 'pointer'
                : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {submitting ? '作成中...' : '注文を作成'}
        </button>
      </form>
    </div>
  );
};

export default CreateOrderForm;
