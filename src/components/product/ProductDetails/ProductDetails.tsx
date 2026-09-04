'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowIcon } from '@/components/icons/Icons';
import FadeImage from '@/components/ui/FadeImage/FadeImage';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import type { Product } from '@/lib/api/types';
import { addItem } from '@/store/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from './ProductDetails.module.scss';

export default function ProductDetails({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const inCart = useAppSelector((state) => state.cart.items.some(({ id }) => id === product.id));
  return (
    <main id="conteudo" className={styles.wrap}>
      <Link className={styles.back} href="/">
        <ArrowIcon size={22} /> Voltar para a loja
      </Link>
      <motion.article className={styles.details} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.visual}>
          <FadeImage
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 800px) 90vw, 48vw"
          />
        </div>
        <div className={styles.content}>
          <span className={styles.eyebrow}>COLECIONÁVEL #{product.id}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <PriceEth value={product.price} />
          <button type="button" onClick={() => dispatch(addItem(product))}>
            {inCart ? 'ADICIONADO AO CARRINHO' : 'COMPRAR'}
          </button>
        </div>
      </motion.article>
    </main>
  );
}
