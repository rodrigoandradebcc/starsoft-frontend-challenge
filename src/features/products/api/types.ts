export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  createdAt: string;
}

export interface ProductPage {
  products: Product[];
  page: number;
  rows: number;
  total: number;
  hasNextPage: boolean;
}

export interface ListProductsParams {
  page?: number;
  rows?: number;
  sortBy?: 'id' | 'name' | 'price';
  orderBy?: 'ASC' | 'DESC';
}
export const DEFAULT_PAGE_SIZE = 8;
