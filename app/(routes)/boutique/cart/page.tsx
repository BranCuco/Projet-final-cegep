'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearCart, getShippingAddresses, loadCart, getCartTotal, getProducts, removeFromCart, updateCartQuantity, isAuthenticated, type CartItem, type Product, type ShippingAddress } from '@/lib/api';
import './cart.scss';

type CartLineItem = CartItem & { product: Product };

export default function CartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?reason=cart');
      return;
    }

    const loadData = async () => {
      const [productsData, cartData, addressesData] = await Promise.all([getProducts(), loadCart(), getShippingAddresses()]);
      setProducts(productsData);
      setCartItems(cartData);
      setShippingAddresses(addressesData);

      const defaultAddress = addressesData.find((address) => address.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      } else {
        setSelectedAddressId(null);
      }

      setLoading(false);
    };

    loadData();

    const refreshCart = async () => setCartItems(await loadCart());
    window.addEventListener('techgear:cart-updated', refreshCart as EventListener);
    window.addEventListener('storage', refreshCart as EventListener);

    return () => {
      window.removeEventListener('techgear:cart-updated', refreshCart as EventListener);
      window.removeEventListener('storage', refreshCart as EventListener);
    };
  }, [router]);

  const cartLines = useMemo<CartLineItem[]>(() => {
    const productMap = new Map(products.map((product) => [String(product.id), product]));
    return cartItems
      .map((item) => {
        const product = productMap.get(String(item.productId)) ?? item.product;
        return product ? { ...item, product } : null;
      })
      .filter((item): item is CartLineItem => item !== null);
  }, [cartItems, products]);

  const total = useMemo(() => getCartTotal(cartItems, new Map(products.map((product) => [Number(product.id), product]))), [cartItems, products]);

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId) {
      return null;
    }

    return shippingAddresses.find((address) => address.id === selectedAddressId) || null;
  }, [shippingAddresses, selectedAddressId]);

  const handleDecrease = async (productId: string | number, quantity: number) => {
    await updateCartQuantity(productId, quantity - 1);
    setCartItems(await loadCart());
  };

  const handleIncrease = async (productId: string | number, quantity: number, stock: number) => {
    await updateCartQuantity(productId, Math.min(quantity + 1, stock));
    setCartItems(await loadCart());
  };

  const handleClearCart = async () => {
    await clearCart();
    setCartItems([]);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isCheckingOut) return;

    if (!isAuthenticated()) {
      router.push('/login?reason=checkout');
      return;
    }

    if (!selectedAddress) {
      setCheckoutError('Ajoutez au moins une adresse de livraison dans votre compte avant de payer.');
      router.push('/account');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la creation de la session Stripe');
      }

      if (!data?.url) {
        throw new Error('Session Stripe invalide');
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Erreur lors du paiement');
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-loading">Chargement du panier...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <div className="container">
          <h1>Votre panier</h1>
          <p>Vérifiez vos produits avant de finaliser l'achat</p>
        </div>
      </section>

      <section className="cart-content">
        <div className="container">
          {cartLines.length === 0 ? (
            <div className="empty-cart">
              <h2>Votre panier est vide</h2>
              <p>Ajoutez des produits depuis la boutique pour commencer.</p>
              <Link href="/boutique" className="btn btn-primary">
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-main">
                <section className="delivery-card">
                  <div className="delivery-card-head">
                    <h2>Lieu de livraison</h2>
                    {shippingAddresses.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowAddressPicker((current) => !current)}
                      >
                        {showAddressPicker ? 'Fermer' : 'Changer'}
                      </button>
                    )}
                  </div>

                  {selectedAddress ? (
                    <>
                      <p className="delivery-recipient">Livrer à {selectedAddress.recipientName}</p>
                      <p className="delivery-lines">{selectedAddress.addressLine1}</p>
                      {selectedAddress.addressLine2 && <p className="delivery-lines">{selectedAddress.addressLine2}</p>}
                      <p className="delivery-lines">
                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                      </p>
                      <p className="delivery-phone">Tel: {selectedAddress.phoneNumber || 'Non renseigné'}</p>

                      {showAddressPicker && (
                        <div className="delivery-picker">
                          {shippingAddresses.map((address) => (
                            <label key={address.id} className={`delivery-option ${address.id === selectedAddressId ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="selectedDeliveryAddress"
                                checked={address.id === selectedAddressId}
                                onChange={() => {
                                  setSelectedAddressId(address.id);
                                  setCheckoutError(null);
                                }}
                              />
                              <span>
                                <strong>{address.label || 'Adresse'}</strong> - {address.recipientName}, {address.addressLine1}, {address.city}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="delivery-empty">
                      <p>Ajoutez une adresse de livraison pour continuer au paiement.</p>
                    </div>
                  )}

                  <Link href="/account" className="delivery-manage-link">
                    {shippingAddresses.length === 0 ? 'Ajouter une adresse de livraison' : 'Gérer mes adresses'}
                  </Link>
                </section>

                <div className="cart-items">
                  {cartLines.map(({ product, quantity }) => (
                    <article key={product.id} className="cart-item">
                      <img src={product.image} alt={product.name} className="cart-item-image" />
                      <div className="cart-item-info">
                        <h3>{product.name}</h3>
                        <p>{product.category || 'Produit'}</p>
                        <strong>${product.price.toFixed(2)}</strong>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button type="button" onClick={() => handleDecrease(product.id, quantity)} aria-label="Diminuer la quantité">
                            −
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(product.id, quantity, product.stock)}
                            aria-label="Augmenter la quantité"
                            disabled={quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={async () => {
                            await removeFromCart(product.id);
                            setCartItems(await loadCart());
                          }}
                        >
                          Retirer
                        </button>
                        {quantity >= product.stock && (
                          <small style={{ color: '#c0392b' }}>Stock maximum atteint</small>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="cart-summary">
                <button
                  type="button"
                  className="btn-place-order"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                >
                  {isCheckingOut ? 'Redirection vers Stripe...' : 'Passer la commande'}
                </button>

                <p className="summary-legal">
                  En passant votre commande, vous acceptez la <Link href="/privacy">politique de confidentialité TechGear</Link>{' '}
                  et les <Link href="/terms">conditions d&apos;utilisation TechGear</Link>.
                </p>

                <div className="summary-divider" />

                <div className="summary-row">
                  <span>Items:</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <div className="summary-row total">
                  <span>Order Total:</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                {checkoutError && (
                  <div className="alert alert-error">{checkoutError}</div>
                )}

                <div className="summary-actions">
                  <button type="button" className="btn btn-danger btn-block" onClick={handleClearCart}>
                    Vider le panier
                  </button>
                  <Link href="/boutique" className="btn btn-outline btn-block">
                    Continuer mes achats
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}