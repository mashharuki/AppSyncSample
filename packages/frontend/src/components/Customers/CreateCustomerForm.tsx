import { generateClient } from 'aws-amplify/api';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateCustomerInput } from '../../graphql/generated';

const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      customerId
      name
      email
    }
  }
`;

interface CreateCustomerFormProps {
  onSuccess: () => void;
}

const CreateCustomerForm = ({ onSuccess }: CreateCustomerFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side email validation
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    // Additional check: if name is empty
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);

      const client = generateClient();
      const input: CreateCustomerInput = {
        name,
        email,
      };

      const response = await client.graphql({
        query: CREATE_CUSTOMER_MUTATION,
        variables: { input },
      });

      if ('data' in response && response.data) {
        // Reset form on success
        setName('');
        setEmail('');
        setError(null);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Create New Customer</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

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
          disabled={submitting}
          style={{
            padding: '10px 20px',
            backgroundColor: submitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {submitting ? 'Creating...' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
};

export default CreateCustomerForm;
