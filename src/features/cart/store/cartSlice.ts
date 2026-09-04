import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/features/products/api/types';

export interface CartItem extends Product {
  quantity: number;
}
interface CartState {
  items: CartItem[];
  hydrated: boolean;
}
const initialState: CartState = { items: [], hydrated: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, { payload }: PayloadAction<Product>) {
      const item = state.items.find(({ id }) => id === payload.id);
      if (item) item.quantity += 1;
      else state.items.push({ ...payload, quantity: 1 });
    },
    removeItem(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter(({ id }) => id !== payload);
    },
    decreaseItem(state, { payload }: PayloadAction<string>) {
      const item = state.items.find(({ id }) => id === payload);
      if (!item) return;
      if (item.quantity === 1) state.items = state.items.filter(({ id }) => id !== payload);
      else item.quantity -= 1;
    },
    clearCart(state) {
      state.items = [];
    },
    hydrateCart(state, { payload }: PayloadAction<CartItem[]>) {
      state.items = payload;
      state.hydrated = true;
    },
  },
});
export const { addItem, removeItem, decreaseItem, clearCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
