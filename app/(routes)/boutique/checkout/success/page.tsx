"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clearCart } from "@/lib/api";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmPurchase = async () => {
      if (!sessionId) {
        clearCart();
        return;
      }

      try {
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setStatusMessage(data?.error || "Erreur lors de la mise à jour du stock.");
        } else {
          setStatusMessage("Stock mis à jour avec succès.");
        }
      } catch (error) {
        setStatusMessage("Erreur lors de la confirmation de paiement.");
      } finally {
        clearCart();
      }
    };

    confirmPurchase();
  }, [sessionId]);

  return (
    <div className="container" style={{ padding: "3rem 1rem" }}>
      <h1>Merci pour votre achat !</h1>
      <p>Votre paiement a ete accepte. Vous recevrez un courriel de confirmation sous peu.</p>
      {statusMessage && <p>{statusMessage}</p>}
      <div style={{ marginTop: "2rem" }}>
        <Link href="/boutique" className="btn btn-primary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "3rem 1rem" }}>Chargement...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
