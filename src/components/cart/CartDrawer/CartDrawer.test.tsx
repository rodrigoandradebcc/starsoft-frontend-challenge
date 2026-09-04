import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { useAppDispatch } from '@/store/hooks';
import { makeStore } from '@/store/store';
import { openCart } from '@/store/uiSlice';
import CartDrawer from './CartDrawer';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: { button: 'button', aside: 'aside', article: 'article' },
}));

const product = {
  id: '1',
  name: 'Orb',
  description: 'Magic',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 2,
  createdAt: '',
};
function Harness() {
  const dispatch = useAppDispatch();
  return (
    <>
      <button type="button" onClick={() => dispatch(openCart())}>
        Open test cart
      </button>
      <CartDrawer />
    </>
  );
}

describe('CartDrawer', () => {
  it('moves focus into the dialog, closes with Escape and restores focus', async () => {
    const store = makeStore();
    store.dispatch(addItem(product));
    render(
      <Provider store={store}>
        <Harness />
      </Provider>,
    );
    const opener = screen.getByRole('button', { name: 'Open test cart' });
    await userEvent.click(opener);
    expect(screen.getAllByRole('button', { name: 'Fechar carrinho' })[1]).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('updates quantity, removes items and traps focus inside the dialog', async () => {
    const store = makeStore();
    store.dispatch(addItem(product));
    render(
      <Provider store={store}>
        <Harness />
      </Provider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open test cart' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade' }));
    expect(screen.getByText('2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover item Orb' }));
    expect(screen.getByText('Seu carrinho está vazio')).toBeInTheDocument();
  });
});
