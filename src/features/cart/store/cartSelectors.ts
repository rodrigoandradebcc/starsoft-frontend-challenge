import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0),
);

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

export const selectIsInCart = (id: string) => (state: RootState) =>
  state.cart.items.some((item) => item.id === id);
