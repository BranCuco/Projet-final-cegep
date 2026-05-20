'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { clearCart } from '@/lib/api';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1>Merci pour votre achat !</h1>
      <p>Votre paiement a ete accepte. Vous recevrez un courriel de confirmation sous peu.</p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/boutique" className="btn btn-primary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
