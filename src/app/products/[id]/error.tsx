'use client';
export default function ProductError({ reset }: { reset: () => void }) {
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
