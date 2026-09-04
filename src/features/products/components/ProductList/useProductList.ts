'use client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { Product } from '@/lib/api/types';
import { productsInfiniteOptions } from '@/lib/query/products';

export interface ProductListState {
  products: Product[];
  progress: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  hasPaginationError: boolean;
  loadMore: () => void;
}

export function useProductList(): ProductListState {
  const query = useSuspenseInfiniteQuery(productsInfiniteOptions());
  const products = query.data.pages.flatMap((page) => page.products);
  const total = query.data.pages[0].total;
  const progress = total > 0 ? Math.min(100, Math.round((products.length / total) * 100)) : 0;
  return {
    products,
    progress,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    hasPaginationError: query.isFetchNextPageError,
    loadMore: () => query.fetchNextPage(),
  };
}
