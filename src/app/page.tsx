import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import ProductList from '@/features/products/components/ProductList/ProductList';
import ProductListSkeleton from '@/features/products/components/ProductList/ProductListSkeleton';
import { createQueryClient } from '@/lib/query/client';
import { productsInfiniteOptions } from '@/features/products';

export const revalidate = 300;

export default async function HomePage() {
  const queryClient = createQueryClient();
  await queryClient.prefetchInfiniteQuery(productsInfiniteOptions());
  return (
    <main id="conteudo">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
}
