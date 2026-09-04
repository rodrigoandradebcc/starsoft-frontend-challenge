'use client';
import { m } from 'framer-motion';
import { TrashIcon } from '@/components/icons/Icons';
import FadeImage from '@/components/ui/FadeImage/FadeImage';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import type { CartItem } from '@/features/cart/store/cartSlice';
import styles from './CartDrawer.module.scss';

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

/** Linha do carrinho: miniatura, dados do item, controle de quantidade e remoção. */
export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }: CartItemRowProps) {
  return (
    <m.article
      layout
      className={styles.item}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className={styles.thumb}>
        <FadeImage src={item.image} alt="" fill sizes="118px" />
      </div>
      <div className={styles.info}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <PriceEth value={item.price} compact />
        <div className={styles.stepper}>
          <m.button
            whileTap={{ scale: 0.85 }}
            type="button"
            aria-label="Diminuir quantidade"
            onClick={onDecrease}
          >
            −
          </m.button>
          <span>{item.quantity}</span>
          <m.button
            whileTap={{ scale: 0.85 }}
            type="button"
            aria-label="Aumentar quantidade"
            onClick={onIncrease}
          >
            +
          </m.button>
        </div>
      </div>
      <m.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={styles.trash}
        type="button"
        aria-label={`Remover item ${item.name}`}
        onClick={onRemove}
      >
        <TrashIcon />
      </m.button>
    </m.article>
  );
}
