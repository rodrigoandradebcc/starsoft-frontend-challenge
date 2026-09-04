'use client';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { ArrowIcon } from '@/components/icons/Icons';
import PriceEth from '@/components/ui/PriceEth/PriceEth';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { selectCartItems, selectCartTotal } from '@/features/cart/store/cartSelectors';
import { addItem, decreaseItem, removeItem } from '@/features/cart/store/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCart } from '@/features/cart/store/uiSlice';
import styles from './CartDrawer.module.scss';
import CartItemRow from './CartItemRow';
import { useCheckout } from '@/features/cart/hooks/useCheckout';

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.cartOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { finished, finish } = useCheckout();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => dispatch(closeCart()), [dispatch]);

  useBodyScrollLock(open);
  useFocusTrap({
    active: open,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
    onEscape: close,
  });

  return (
    <AnimatePresence>
      {open ? (
        <div className={styles.portal}>
          <m.button
            className={styles.backdrop}
            type="button"
            aria-label="Fechar carrinho"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.aside
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
              <m.button
                ref={closeButtonRef}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={styles.back}
                type="button"
                aria-label="Fechar carrinho"
                onClick={close}
              >
                <ArrowIcon />
              </m.button>
              <h2 id="cart-title">Mochila de Compras</h2>
            </header>
            <div className={styles.items}>
              <AnimatePresence initial={false}>
                {items.length ? (
                  items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onIncrease={() => dispatch(addItem(item))}
                      onDecrease={() => dispatch(decreaseItem(item.id))}
                      onRemove={() => dispatch(removeItem(item.id))}
                    />
                  ))
                ) : (
                  <m.div
                    key="empty"
                    className={styles.empty}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p>Seu carrinho está vazio</p>
                    <span>Escolha um item para começar sua coleção.</span>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            <footer>
              <div className={styles.total}>
                <strong>TOTAL</strong>
                <PriceEth value={total} />
              </div>
              <m.button
                whileTap={{ scale: 0.98 }}
                className={styles.checkout}
                type="button"
                disabled={!items.length && !finished}
                onClick={finish}
              >
                {finished ? 'COMPRA FINALIZADA!' : 'FINALIZAR COMPRA'}
              </m.button>
            </footer>
          </m.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
