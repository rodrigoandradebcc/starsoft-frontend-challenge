import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import ProductCard from './ProductCard';

jest.mock('framer-motion', () => ({ m: { article: 'article', button: 'button' } }));

const product = {
  id: '1',
  name: 'Magic Orb',
  description: 'A rare magical item',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 0.35,
  createdAt: '',
};

describe('ProductCard', () => {
  it('shows product information and changes the buy label after adding it', async () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByRole('heading', { name: 'Magic Orb' })).toBeInTheDocument();
    expect(screen.getByText('0.35 ETH')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'COMPRAR' }));
    expect(screen.getByRole('button', { name: 'ADICIONADO AO CARRINHO' })).toBeInTheDocument();
  });
});
