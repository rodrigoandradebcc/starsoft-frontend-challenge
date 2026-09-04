import styles from './ProductList.module.scss';

interface LoadMoreProps {
  progress: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  hasPaginationError: boolean;
  onLoadMore: () => void;
}

function label({
  isFetchingNextPage,
  hasNextPage,
}: Pick<LoadMoreProps, 'isFetchingNextPage' | 'hasNextPage'>) {
  if (isFetchingNextPage) return 'Carregando…';
  return hasNextPage ? 'Carregar mais' : 'Você já viu tudo';
}

/** Barra de progresso do catálogo, botão de paginação e recuperação de erro. */
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
        {label({ isFetchingNextPage, hasNextPage })}
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
