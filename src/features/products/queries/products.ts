import { infiniteQueryOptions } from '@tanstack/react-query';
import { productsService } from '@/lib/api/products.service';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/types';

export function productsInfiniteOptions() {
  return infiniteQueryOptions({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => productsService.list({ page: pageParam, rows: DEFAULT_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}
