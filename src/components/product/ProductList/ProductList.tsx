'use client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import { productsInfiniteOptions } from '@/lib/query/products';
import styles from './ProductList.module.scss';

export default function ProductList() {
  const query = useSuspenseInfiniteQuery(productsInfiniteOptions());
  const products = query.data.pages.flatMap((page) => page.products);
  const initialPage = query.data.pages[0];
  const progress = Math.min(100, Math.round((products.length / initialPage.total) * 100));
  if (!products.length)
    return (
      <div className={styles.empty}>
        <h1>Nenhum produto encontrado</h1>
        <p>Volte em breve para descobrir novos itens.</p>
      </div>
    );
  return (
    <section aria-label="Produtos" className={styles.section}>
      <h1 className={styles.srOnly}>Marketplace de NFTs Starsoft</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className={styles.load}>
        <div
          className={styles.track}
          role="progressbar"
          aria-label="Produtos carregados"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          disabled={!query.hasNextPage || query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage
            ? 'Carregando…'
            : query.hasNextPage
              ? 'Carregar mais'
              : 'Você já viu tudo'}
        </button>
        {query.isFetchNextPageError ? (
          <p role="alert">
            Não foi possível carregar mais.{' '}
            <button type="button" onClick={() => query.fetchNextPage()}>
              Tentar novamente
            </button>
          </p>
        ) : null}
      </div>
    </section>
  );
}
