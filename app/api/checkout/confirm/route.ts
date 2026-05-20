import Stripe from 'stripe';

type CheckoutItem = {
  productId: string | number;
  quantity: number;
};

type Product = {
  id: string | number;
  stock: number;
};

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';


async function fetchProductById(id: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const product = await response.json();
  return product ?? null;
}

async function updateProductStock(id: string, stock: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock }),
  });

  return response.ok;
}

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return Response.json(
      { error: 'Missing STRIPE_SECRET_KEY' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-04-22.dahlia',
  });

  const body = await request.json().catch(() => null);
  const sessionId = String(body?.sessionId || '').trim();

  if (!sessionId) {
    return Response.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    return Response.json({ error: 'Invalid Stripe session' }, { status: 400 });
  }

  if (session.payment_status !== 'paid') {
    return Response.json(
      { error: 'Payment not completed' },
      { status: 400 }
    );
  }

  const metadata = session.metadata ?? {};
  if (metadata.stockReduced === 'true') {
    return Response.json({ ok: true, message: 'Stock already updated' });
  }

  let items: CheckoutItem[] = [];
  try {
    const parsed = JSON.parse(metadata.items || '[]');
    if (Array.isArray(parsed)) {
      items = parsed
        .map((item) => ({
          productId: String(item.productId),
          quantity: Number(item.quantity),
        }))
        .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);
    }
  } catch (error) {
    return Response.json({ error: 'Invalid items metadata' }, { status: 400 });
  }

  if (items.length === 0) {
    return Response.json({ error: 'No items to update' }, { status: 400 });
  }

  for (const item of items) {
    const product = await fetchProductById(String(item.productId));
    if (!product) {
      return Response.json(
        { error: `Produit introuvable: ${item.productId}` },
        { status: 404 }
      );
    }

    const nextStock = Math.max(0, product.stock - item.quantity);
    const updated = await updateProductStock(String(item.productId), nextStock);

    if (!updated) {
      return Response.json(
        { error: `Erreur mise à jour stock: ${item.productId}` },
        { status: 500 }
      );
    }
  }

  await stripe.checkout.sessions.update(sessionId, {
    metadata: {
      ...metadata,
      stockReduced: 'true',
    },
  });

  return Response.json({ ok: true });
}
