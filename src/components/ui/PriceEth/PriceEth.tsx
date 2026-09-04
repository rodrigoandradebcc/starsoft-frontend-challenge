import { EthIcon } from '@/components/icons/Icons';
import { formatEth } from '@/lib/format/eth';
import styles from './PriceEth.module.scss';
export default function PriceEth({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <span className={compact ? styles.compact : styles.price}>
      <EthIcon />
      {formatEth(value)}
    </span>
  );
}
