import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import ProductDetails from './ProductDetails';

jest.mock('framer-motion', () => ({ m: { article: 'article', button: 'button' } }));

const product = {
  id: '7',
  name: 'Magic Orb',
  description: 'A rare magical item',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 0.35,
  createdAt: '',
};

describe('ProductDetails', () => {
  it('shows product information and a link back to the store', () => {
    renderWithProviders(<ProductDetails product={product} />);
    expect(screen.getByRole('heading', { name: 'Magic Orb' })).toBeInTheDocument();
    expect(screen.getByText('A rare magical item')).toBeInTheDocument();
    expect(screen.getByText('0.35 ETH')).toBeInTheDocument();
    expect(screen.getByText('COLECIONÁVEL #7')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para a loja/ })).toHaveAttribute('href', '/');
  });

  it('changes the buy label after adding the product to the cart', async () => {
    renderWithProviders(<ProductDetails product={product} />);
    await userEvent.click(screen.getByRole('button', { name: 'COMPRAR' }));
    expect(screen.getByRole('button', { name: 'ADICIONADO AO CARRINHO' })).toBeInTheDocument();
  });
});
