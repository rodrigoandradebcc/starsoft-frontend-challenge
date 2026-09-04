'use client';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowIcon, TrashIcon } from '@/components/icons/Icons';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import { addItem, clearCart, decreaseItem, removeItem } from '@/store/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCart } from '@/store/uiSlice';
import styles from './CartDrawer.module.scss';

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.cartOpen);
  const items = useAppSelector((state) => state.cart.items);
  const [finished, setFinished] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(closeCart());
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      openerRef.current?.focus();
    };
  }, [dispatch, open]);
  const finish = () => {
    setFinished(true);
    dispatch(clearCart());
    window.setTimeout(() => setFinished(false), 2200);
  };
  return (
    <AnimatePresence>
      {open ? (
        <div className={styles.portal}>
          <motion.button
            className={styles.backdrop}
            type="button"
            aria-label="Fechar carrinho"
            onClick={() => dispatch(closeCart())}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 290, damping: 31 }}
          >
            <header>
              <button
                ref={closeButtonRef}
                className={styles.back}
                type="button"
                aria-label="Fechar carrinho"
                onClick={() => dispatch(closeCart())}
              >
                <ArrowIcon />
              </button>
              <h2 id="cart-title">Mochila de Compras</h2>
            </header>
            <div className={styles.items}>
              {items.length ? (
                items.map((item) => (
                  <motion.article layout key={item.id} className={styles.item}>
                    <div className={styles.thumb}>
                      <Image src={item.image} alt="" fill sizes="84px" />
                    </div>
                    <div className={styles.info}>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <PriceEth value={item.price} compact />
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          aria-label="Diminuir quantidade"
                          onClick={() => dispatch(decreaseItem(item.id))}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Aumentar quantidade"
                          onClick={() => dispatch(addItem(item))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className={styles.trash}
                      type="button"
                      aria-label={`Remover item ${item.name}`}
                      onClick={() => dispatch(removeItem(item.id))}
                    >
                      <TrashIcon />
                    </button>
                  </motion.article>
                ))
              ) : (
                <div className={styles.empty}>
                  <p>Seu carrinho está vazio</p>
                  <span>Escolha um item para começar sua coleção.</span>
                </div>
              )}
            </div>
            <footer>
              <div className={styles.total}>
                <strong>TOTAL</strong>
                <PriceEth value={total} />
              </div>
              <button
                className={styles.checkout}
                type="button"
                disabled={!items.length && !finished}
                onClick={finish}
              >
                {finished ? 'COMPRA FINALIZADA!' : 'FINALIZAR COMPRA'}
              </button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
