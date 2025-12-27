import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import type { Product, ProductConnection } from '../../graphql/generated';

const LIST_PRODUCTS_QUERY = `
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

const LIST_PRODUCTS_BY_CATEGORY_QUERY = `
  query ListProductsByCategory($category: String!, $limit: Int, $nextToken: String) {
    listProductsByCategory(category: $category, limit: $limit, nextToken: $nextToken) {
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

interface ListProductsData {
  listProducts: ProductConnection;
}

interface ListProductsByCategoryData {
  listProductsByCategory: ProductConnection;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fetchProducts = async (token: string | null = null, category = '') => {
    try {
      setLoading(true);
      setError(null);

      const client = generateClient();

      if (category) {
        // Use category filter query
        const response = await client.graphql({
          query: LIST_PRODUCTS_BY_CATEGORY_QUERY,
          variables: {
            category,
            limit: 20,
            nextToken: token,
          },
        });

        if ('data' in response && response.data) {
          const data = response.data as unknown as ListProductsByCategoryData;
          setProducts(data.listProductsByCategory.items);
          setNextToken(data.listProductsByCategory.nextToken || null);
        }
      } else {
        // Use list all products query
        const response = await client.graphql({
          query: LIST_PRODUCTS_QUERY,
          variables: {
            limit: 20,
            nextToken: token,
          },
        });

        if ('data' in response && response.data) {
          const data = response.data as unknown as ListProductsData;
          setProducts(data.listProducts.items);
          setNextToken(data.listProducts.nextToken || null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(null, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleNextPage = () => {
    if (nextToken) {
      fetchProducts(nextToken, selectedCategory);
    }
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value;
    setSelectedCategory(category);
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Products</h1>

        <div>
          <label htmlFor="category-filter" style={{ marginRight: '10px' }}>
            Category:
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          <p>No products found</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {products.map((product) => (
            <div
              key={product.productId}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>
                {product.name}
              </h3>
              <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                <span
                  style={{
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {product.category}
                </span>
              </div>
              <div
                style={{
                  marginBottom: '12px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#007bff',
                }}
              >
                ${product.price.toFixed(2)}
              </div>
              {product.description && (
                <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  {product.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {nextToken && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
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

export default ProductListPage;
