'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
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
