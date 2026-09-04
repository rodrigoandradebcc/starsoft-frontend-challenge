import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, cartEverOpened: false },
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
      state.cartEverOpened = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
      if (state.cartOpen) state.cartEverOpened = true;
    },
  },
});
export const { openCart, closeCart, toggleCart } = uiSlice.actions;
export default uiSlice.reducer;
