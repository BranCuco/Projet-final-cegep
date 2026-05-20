import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1>Paiement annule</h1>
      <p>Le paiement a ete annule. Vous pouvez reprendre votre commande.</p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/boutique/cart" className="btn btn-primary">
          Retour au panier
        </Link>
      </div>
    </div>
  );
}
