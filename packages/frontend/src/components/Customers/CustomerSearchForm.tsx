import { generateClient } from 'aws-amplify/api';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Customer } from '../../graphql/generated';

const SEARCH_CUSTOMER_BY_EMAIL_QUERY = `
  query SearchCustomerByEmail($email: String!) {
    searchCustomerByEmail(email: $email) {
      customerId
      name
      email
    }
  }
`;

interface SearchCustomerByEmailData {
  searchCustomerByEmail: Customer | null;
}

const CustomerSearchForm = () => {
  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSearched(false);

    // Client-side email validation
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setLoading(true);

      const client = generateClient();
      const response = await client.graphql({
        query: SEARCH_CUSTOMER_BY_EMAIL_QUERY,
        variables: { email },
      });

      if ('data' in response && response.data) {
        const data = response.data as unknown as SearchCustomerByEmailData;
        setCustomer(data.searchCustomerByEmail);
        setSearched(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search Customer by Email</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          {error && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fee',
                color: '#c00',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && (
        <div style={{ marginTop: '40px' }}>
          {customer === null ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              顧客が見つかりません
            </div>
          ) : customer ? (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Customer ID
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{customer.customerId}</td>
                  <td style={{ padding: '12px' }}>{customer.name}</td>
                  <td style={{ padding: '12px' }}>{customer.email}</td>
                </tr>
              </tbody>
            </table>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CustomerSearchForm;
