export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateCustomerInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateOrderInput = {
  customerId: Scalars['ID']['input'];
  orderItems: Array<CreateOrderItemInput>;
};

export type CreateOrderItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type CreateProductInput = {
  category: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};

export type Customer = {
  __typename?: 'Customer';
  customerId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  orders: Array<Order>;
};

export type CustomerConnection = {
  __typename?: 'CustomerConnection';
  items: Array<Customer>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type CustomerStats = {
  __typename?: 'CustomerStats';
  activeCustomers: Scalars['Int']['output'];
  totalCustomers: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCustomer: Customer;
  createOrder: Order;
  createProduct: Product;
};


export type MutationCreateCustomerArgs = {
  input: CreateCustomerInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};

export type Order = {
  __typename?: 'Order';
  customer: Customer;
  customerId: Scalars['ID']['output'];
  orderDate: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  orderItems: Array<OrderItem>;
  status: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type OrderConnection = {
  __typename?: 'OrderConnection';
  items: Array<Order>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  orderId: Scalars['ID']['output'];
  orderItemId: Scalars['ID']['output'];
  product: Product;
  productId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type Product = {
  __typename?: 'Product';
  category: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  productId: Scalars['ID']['output'];
};

export type ProductConnection = {
  __typename?: 'ProductConnection';
  items: Array<Product>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type ProductRanking = {
  __typename?: 'ProductRanking';
  productId: Scalars['ID']['output'];
  productName: Scalars['String']['output'];
  totalQuantity: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  getCustomer?: Maybe<Customer>;
  getCustomerStats: CustomerStats;
  getOrder?: Maybe<Order>;
  getProduct?: Maybe<Product>;
  getProductRanking: Array<ProductRanking>;
  getSalesSummary: SalesSummary;
  listCustomers: CustomerConnection;
  listOrders: OrderConnection;
  listOrdersByCustomer: OrderConnection;
  listProducts: ProductConnection;
  listProductsByCategory: ProductConnection;
  searchCustomerByEmail?: Maybe<Customer>;
};


export type QueryGetCustomerArgs = {
  customerId: Scalars['ID']['input'];
};


export type QueryGetOrderArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryGetProductArgs = {
  productId: Scalars['ID']['input'];
};


export type QueryGetProductRankingArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryListCustomersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListOrdersByCustomerArgs = {
  customerId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListProductsByCategoryArgs = {
  category: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchCustomerByEmailArgs = {
  email: Scalars['String']['input'];
};

export type SalesSummary = {
  __typename?: 'SalesSummary';
  averageOrderValue: Scalars['Float']['output'];
  orderCount: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};
