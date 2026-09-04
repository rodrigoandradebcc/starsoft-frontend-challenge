import { isAllowedImageUrl } from '@/lib/config/images';
import { apiFetch } from '@/lib/api/client';
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
    isAllowedImageUrl(product.image) &&
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

const MAX_ROWS = 50;
const MAX_PAGES = 50;

async function listAll(): Promise<Product[]> {
  const products: Product[] = [];
  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    const page = await list({ page: pageNumber, rows: MAX_ROWS, sortBy: 'id', orderBy: 'ASC' });
    products.push(...page.products);
    if (!page.hasNextPage) break;
  }
  return products;
}

async function listAllIds(): Promise<string[]> {
  return (await listAll()).map((product) => product.id);
}

async function getById(id: string): Promise<Product | undefined> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) return undefined;
  return (await listAll()).find((product) => product.id === id);
}

export const productsService = { list, listAll, listAllIds, getById };
