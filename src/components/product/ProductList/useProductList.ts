'use client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { productsInfiniteOptions } from '@/lib/query/products';
import type { Product } from '@/lib/api/types';

export interface ProductListState {
  products: Product[];
  /** Percentual do catálogo já carregado, de 0 a 100. */
  progress: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  hasPaginationError: boolean;
  loadMore: () => void;
}

/** Concentra paginação e progresso do catálogo, deixando a view sem lógica de dados. */
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
