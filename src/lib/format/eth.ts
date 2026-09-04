const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });
export function formatEth(value: number): string {
  return `${formatter.format(value)} ETH`;
}
