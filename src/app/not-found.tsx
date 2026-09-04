import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="conteudo" className="statusPage">
      <div className="statusCard">
        <h1>Produto não encontrado</h1>
        <p>Este item pode não estar mais disponível.</p>
        <Link className="statusAction" href="/">
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}
