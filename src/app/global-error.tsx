'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global]', error.digest ?? error.message, error);
  }, [error]);
  return (
    <html lang="pt-BR">
      <body>
        <main className="statusPage">
          <div className="statusCard">
            <h1>Algo deu errado</h1>
            <p>Recarregue a página para continuar.</p>
            <button className="statusAction" type="button" onClick={reset}>
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
