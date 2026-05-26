import Stripe from 'stripe';

type CheckoutItem = {
  productId: string | number;
  quantity: number;
};

type CheckoutOrderResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};

type Product = {
  id: string | number;
  stock: number;
};

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5227/api';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const backendAdminUsername = process.env.BACKEND_ADMIN_USERNAME || 'admin';
const backendAdminPassword = process.env.BACKEND_ADMIN_PASSWORD || 'Admin123!';

let backendAdminTokenCache: string | null = null;

async function createOrderFromCheckout(payload: {
  stripeSessionId: string;
  customerEmail: string;
  items: CheckoutItem[];
}): Promise<CheckoutOrderResponse> {
  const adminToken = await getBackendAdminToken();

  const response = await fetch(`${API_BASE_URL}/orders/from-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(payload),
  });

  return (await response.json().catch(() => null)) as CheckoutOrderResponse;
}

async function getBackendAdminToken(): Promise<string> {
  if (backendAdminTokenCache) {
    return backendAdminTokenCache;
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: backendAdminUsername,
      password: backendAdminPassword,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to authenticate against backend');
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('Backend token missing');
  }

  backendAdminTokenCache = data.token;
  return backendAdminTokenCache;
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
  if (metadata.orderCreated === 'true') {
    return Response.json({ ok: true, message: 'Order already created' });
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

  const customerEmail = String(metadata.customerEmail || session.customer_details?.email || session.customer_email || '').trim();
  if (!customerEmail) {
    return Response.json({ error: 'Missing customer email for order creation' }, { status: 400 });
  }

  try {
    const orderResult = await createOrderFromCheckout({
      stripeSessionId: sessionId,
      customerEmail,
      items,
    });

    if (orderResult.error) {
      return Response.json({ error: orderResult.error }, { status: 500 });
    }

    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        ...metadata,
        orderCreated: 'true',
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: 'Failed to create order from checkout' }, { status: 500 });
  }
}
