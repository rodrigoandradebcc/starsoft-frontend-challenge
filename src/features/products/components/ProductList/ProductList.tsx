'use client';
import LoadMore from './LoadMore';
import ProductGrid from './ProductGrid';
import styles from './ProductList.module.scss';
import { useProductList } from './useProductList';

export default function ProductList() {
  const { products, progress, hasNextPage, isFetchingNextPage, hasPaginationError, loadMore } =
    useProductList();

  if (!products.length) {
    return (
      <div className={styles.empty}>
        <h1>Nenhum produto encontrado</h1>
        <p>Volte em breve para descobrir novos itens.</p>
      </div>
    );
  }

  return (
    <section aria-label="Produtos" className={styles.section}>
      <h1 className={styles.srOnly}>Marketplace de NFTs Starsoft</h1>
      <ProductGrid products={products} />
      <LoadMore
        progress={progress}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasPaginationError={hasPaginationError}
        onLoadMore={loadMore}
      />
    </section>
  );
}
