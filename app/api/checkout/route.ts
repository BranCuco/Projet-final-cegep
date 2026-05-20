import Stripe from 'stripe';

type CheckoutItem = {
  productId: string | number;
  quantity: number;
};

type Product = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  stock: number;
};

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

function toIntegerAmount(price: number): number {
  return Math.max(0, Math.round(price * 100));
}

function getBaseUrl(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000'
  );
}

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams();
  ids.forEach((id) => params.append('id', id));

  const filteredResponse = await fetch(
    `${API_BASE_URL}/products?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!filteredResponse.ok) {
    throw new Error('Unable to fetch products');
  }

  const filteredData = await filteredResponse.json();
  const filteredProducts = Array.isArray(filteredData) ? filteredData : [];

  if (filteredProducts.length > 0) {
    return filteredProducts;
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to fetch products');
  }

  const data = await response.json();
  const products = Array.isArray(data) ? data : [];
  const idSet = new Set(ids);
  return products.filter((product) => idSet.has(String(product.id)));
}

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return Response.json(
      { error: 'Missing STRIPE_SECRET_KEY' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];

  const normalizedItems = items
    .map((item) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);

  if (normalizedItems.length === 0) {
    return Response.json(
      { error: 'No valid items provided' },
      { status: 400 }
    );
  }

  const uniqueIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));

  let products: Product[] = [];

  try {
    products = await fetchProductsByIds(uniqueIds);
  } catch (error) {
    return Response.json(
      { error: 'Unable to load products' },
      { status: 500 }
    );
  }

  const productMap = new Map(
    products.map((product) => [String(product.id), product])
  );

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      return Response.json(
        { error: `Produit introuvable: ${item.productId}` },
        { status: 400 }
      );
    }

    if (item.quantity > product.stock) {
      return Response.json(
        { error: `Stock insuffisant pour ${product.name}` },
        { status: 400 }
      );
    }
  }

  const lineItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId) as Product;
    const images = product.image ? [product.image] : undefined;

    return {
      quantity: item.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: toIntegerAmount(product.price),
        product_data: {
          name: product.name,
          images,
        },
      },
    };
  });

  const baseUrl = getBaseUrl(request);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/boutique/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/boutique/checkout/cancel`,
      metadata: {
        source: 'techgear',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: 'Stripe checkout session failed' },
      { status: 500 }
    );
  }
}
