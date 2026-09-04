import ProductCard from '@/components/product/ProductCard/ProductCard';
import type { Product } from '@/lib/api/types';
import styles from './ProductList.module.scss';

const PRELOADED_CARDS = 4;

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} preload={index < PRELOADED_CARDS} />
      ))}
    </div>
  );
}
