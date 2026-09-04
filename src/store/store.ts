import { configureStore } from '@reduxjs/toolkit';
import { createCartPersistenceMiddleware } from './cartMiddleware';
import cart from './cartSlice';
import ui from './uiSlice';

export function makeStore() {
  const persistence = createCartPersistenceMiddleware();
  return configureStore({
    reducer: { cart, ui },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
  });
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
