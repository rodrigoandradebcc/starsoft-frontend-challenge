import { formatEth } from './eth';
describe('formatEth', () => {
  it('formats whole and decimal ETH values', () => {
    expect(formatEth(32)).toBe('32 ETH');
    expect(formatEth(0.35)).toBe('0.35 ETH');
    expect(formatEth(0.1234)).toBe('0.123 ETH');
  });
});
