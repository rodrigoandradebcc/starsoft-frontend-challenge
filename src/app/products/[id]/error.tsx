'use client';
import { useEffect } from 'react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[product]', error.digest ?? error.message, error);
  }, [error]);
  return (
    <main className="statusPage">
      <div className="statusCard">
        <h1>Não foi possível carregar o produto</h1>
        <button className="statusAction" type="button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
