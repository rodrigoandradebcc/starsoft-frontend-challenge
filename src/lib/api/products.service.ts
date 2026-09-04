import { apiFetch } from './client';
import {
  DEFAULT_PAGE_SIZE,
  type ListProductsParams,
  type Product,
  type ProductPage,
} from './types';

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string | number;
  createdAt: string;
}
interface ApiProductsResponse {
  products: ApiProduct[];
  count: number;
}

function isApiProduct(value: unknown): value is ApiProduct {
  if (!value || typeof value !== 'object') return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === 'number' &&
    Number.isInteger(product.id) &&
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    typeof product.image === 'string' &&
    product.image.startsWith('https://softstar.s3.amazonaws.com/items/') &&
    (typeof product.price === 'string' || typeof product.price === 'number') &&
    typeof product.createdAt === 'string'
  );
}

function normalizeProduct(product: ApiProduct): Product {
  const price = Number(product.price);
  if (!Number.isFinite(price)) throw new TypeError(`Invalid price for product ${product.id}`);
  return { ...product, id: String(product.id), price };
}

async function list(params: ListProductsParams = {}): Promise<ProductPage> {
  const page = params.page ?? 1;
  const rows = params.rows ?? DEFAULT_PAGE_SIZE;
  const query = new URLSearchParams({
    page: String(page),
    rows: String(rows),
    sortBy: params.sortBy ?? 'id',
    orderBy: params.orderBy ?? 'ASC',
  });
  const response = await apiFetch<ApiProductsResponse>(`/products?${query}`);
  if (!response || !Array.isArray(response.products) || !Number.isInteger(response.count)) {
    throw new TypeError('Invalid products response');
  }
  if (!response.products.every(isApiProduct)) throw new TypeError('Invalid product data');
  return {
    products: response.products.map(normalizeProduct),
    page,
    rows,
    total: response.count,
    hasNextPage: page * rows < response.count,
  };
}

async function getById(id: string): Promise<Product | undefined> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) return undefined;
  let pageNumber = 1;
  do {
    const page = await list({ page: pageNumber, rows: 50, sortBy: 'id', orderBy: 'ASC' });
    const product = page.products.find((item) => item.id === id);
    if (product || !page.hasNextPage) return product;
    pageNumber += 1;
  } while (true);
}

export const productsService = { list, getById };
