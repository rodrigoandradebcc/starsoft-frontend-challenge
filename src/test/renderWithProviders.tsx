import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { createQueryClient } from '@/lib/query/client';
import { makeStore } from '@/store/store';
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>
    </Provider>,
    options,
  );
}
