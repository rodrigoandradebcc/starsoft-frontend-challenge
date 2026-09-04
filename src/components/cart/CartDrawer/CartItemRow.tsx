'use client';
import { motion } from 'framer-motion';
import { TrashIcon } from '@/components/icons/Icons';
import FadeImage from '@/components/ui/FadeImage/FadeImage';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import type { CartItem } from '@/store/cartSlice';
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
    <motion.article
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
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            aria-label="Diminuir quantidade"
            onClick={onDecrease}
          >
            −
          </motion.button>
          <span>{item.quantity}</span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            aria-label="Aumentar quantidade"
            onClick={onIncrease}
          >
            +
          </motion.button>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={styles.trash}
        type="button"
        aria-label={`Remover item ${item.name}`}
        onClick={onRemove}
      >
        <TrashIcon />
      </motion.button>
    </motion.article>
  );
}
