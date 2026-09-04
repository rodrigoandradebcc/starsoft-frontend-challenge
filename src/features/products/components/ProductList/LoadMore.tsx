import styles from './ProductList.module.scss';

interface LoadMoreProps {
  progress: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  hasPaginationError: boolean;
  onLoadMore: () => void;
}

export default function LoadMore({
  progress,
  hasNextPage,
  isFetchingNextPage,
  hasPaginationError,
  onLoadMore,
}: LoadMoreProps) {
  return (
    <div className={styles.load}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Produtos carregados"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <button type="button" disabled={!hasNextPage || isFetchingNextPage} onClick={onLoadMore}>
        {isFetchingNextPage ? 'Carregando…' : hasNextPage ? 'Carregar mais' : 'Você já viu tudo'}
      </button>
      {hasPaginationError ? (
        <p role="alert">
          Não foi possível carregar mais.{' '}
          <button type="button" onClick={onLoadMore}>
            Tentar novamente
          </button>
        </p>
      ) : null}
    </div>
  );
}
