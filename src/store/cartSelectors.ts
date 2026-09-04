import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

export const selectCartItems = (state: RootState) => state.cart.items;

/** Soma de preço × quantidade de todos os itens. Memoizado por referência da lista. */
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0),
);

/** Quantidade somada de unidades — o número exibido no ícone do carrinho. */
export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

/** Fábrica de selector: `useAppSelector(selectIsInCart(id))` devolve boolean estável. */
export const selectIsInCart = (id: string) => (state: RootState) =>
  state.cart.items.some((item) => item.id === id);
