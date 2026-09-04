import styles from './ProductList.module.scss';

const PLACEHOLDERS = Array.from({ length: 8 }, (_, index) => index);

export default function ProductListSkeleton() {
  return (
    <section className={styles.section} aria-busy="true" aria-label="Carregando produtos">
      <div className={styles.grid}>
        {PLACEHOLDERS.map((index) => (
          <div key={index} className={styles.skeleton} />
        ))}
      </div>
    </section>
  );
}
