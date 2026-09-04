import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import ProductList from '@/components/product/ProductList/ProductList';
import { createQueryClient } from '@/lib/query/client';
import { productsInfiniteOptions } from '@/lib/query/products';

export const revalidate = 300;

export default async function HomePage() {
  const queryClient = createQueryClient();
  await queryClient.prefetchInfiniteQuery(productsInfiniteOptions());
  return (
    <main id="conteudo">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductList />
      </HydrationBoundary>
    </main>
  );
}
