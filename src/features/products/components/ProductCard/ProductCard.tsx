'use client';
import { m } from 'framer-motion';
import Link from 'next/link';
import FadeImage from '@/components/ui/FadeImage/FadeImage';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import type { Product } from '@/features/products/api/types';
import { addItem, selectIsInCart } from '@/features/cart';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from './ProductCard.module.scss';

export default function ProductCard({
  product,
  preload = false,
}: {
  product: Product;
  preload?: boolean;
}) {
  const dispatch = useAppDispatch();
  const inCart = useAppSelector(selectIsInCart(product.id));
  return (
    <m.article
      className={styles.card}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.28 }}
    >
      <Link
        className={styles.imageLink}
        href={`/products/${product.id}`}
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <FadeImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 44vw, (max-width: 1280px) 30vw, 300px"
          preload={preload}
        />
      </Link>
      <div className={styles.body}>
        <Link href={`/products/${product.id}`}>
          <h2>{product.name}</h2>
        </Link>
        <p>
          <span>{product.description}</span>
        </p>
        <PriceEth value={product.price} />
        <m.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => dispatch(addItem(product))}
        >
          {inCart ? 'ADICIONADO AO CARRINHO' : 'COMPRAR'}
        </m.button>
      </div>
    </m.article>
  );
}
