import { configureStore } from '@reduxjs/toolkit';
import { cartReducer, cartUiReducer, createCartPersistenceMiddleware } from '@/features/cart';

export function makeStore() {
  const persistence = createCartPersistenceMiddleware();
  return configureStore({
    reducer: { cart: cartReducer, ui: cartUiReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
  });
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
