'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { BagIcon } from '@/components/icons/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCart } from '@/store/uiSlice';
import styles from './Header.module.scss';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer/CartDrawer'));

export default function Header() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const drawerRequested = useAppSelector((state) => state.ui.cartEverOpened);
  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link className={styles.logo} href="/" aria-label="Starsoft — página inicial">
            <Image src="/logo.svg" alt="Starsoft" width={101} height={38} priority unoptimized />
          </Link>
          <button
            className={styles.cart}
            type="button"
            aria-label={`Abrir carrinho, ${count} itens`}
            onClick={() => dispatch(openCart())}
          >
            <BagIcon />
            <span>{count}</span>
          </button>
        </div>
      </header>
      {drawerRequested ? <CartDrawer /> : null}
    </>
  );
}
