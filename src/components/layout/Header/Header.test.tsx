import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { makeStore } from '@/store/store';
import Header from './Header';

jest.mock('@/components/cart/CartDrawer/CartDrawer', () => ({
  __esModule: true,
  default: () => <div data-testid="cart-drawer" />,
}));

const product = {
  id: '1',
  name: 'Orb',
  description: 'Magic',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 2,
  createdAt: '',
};

describe('Header', () => {
  it('links the logo to the homepage', () => {
    render(
      <Provider store={makeStore()}>
        <Header />
      </Provider>,
    );
    expect(screen.getByRole('link', { name: 'Starsoft — página inicial' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('shows the current number of items in the cart', () => {
    const store = makeStore();
    store.dispatch(addItem(product));
    store.dispatch(addItem(product));
    render(
      <Provider store={store}>
        <Header />
      </Provider>,
    );
    expect(screen.getByRole('button', { name: 'Abrir carrinho, 2 itens' })).toBeInTheDocument();
  });

  it('mounts the cart drawer only after the cart is opened', async () => {
    render(
      <Provider store={makeStore()}>
        <Header />
      </Provider>,
    );
    expect(screen.queryByTestId('cart-drawer')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Abrir carrinho/ }));
    expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
  });
});
