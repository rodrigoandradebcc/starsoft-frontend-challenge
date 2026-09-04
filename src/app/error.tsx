'use client';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[home]', error.digest ?? error.message, error);
  }, [error]);
  return (
    <main id="conteudo" className="statusPage">
      <div className="statusCard">
        <h1>Não foi possível carregar os produtos</h1>
        <p>Confira sua conexão e tente novamente.</p>
        <button className="statusAction" type="button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
