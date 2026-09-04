import Image from 'next/image';
import { formatEth } from '@/lib/format/eth';
import styles from './PriceEth.module.scss';

export default function PriceEth({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <span className={compact ? styles.compact : styles.price}>
      <Image src="/eth.png" alt="" width={29} height={29} className={styles.icon} />
      {formatEth(value)}
    </span>
  );
}
