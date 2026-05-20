'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clearCart, getCart, getCartTotal, getProducts, removeFromCart, updateCartQuantity, type CartItem, type Product } from '@/lib/api';
import './cart.scss';

type CartLineItem = CartItem & { product: Product };

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [productsData, cartData] = await Promise.all([getProducts(), Promise.resolve(getCart())]);
      setProducts(productsData);
      setCartItems(cartData);
      setLoading(false);
    };

    loadData();

    const refreshCart = () => setCartItems(getCart());
    window.addEventListener('techgear:cart-updated', refreshCart);
    window.addEventListener('storage', refreshCart);

    return () => {
      window.removeEventListener('techgear:cart-updated', refreshCart);
      window.removeEventListener('storage', refreshCart);
    };
  }, []);

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

  const handleDecrease = (productId: string | number, quantity: number) => {
    updateCartQuantity(productId, quantity - 1);
  };

  const handleIncrease = (productId: string | number, quantity: number, stock: number) => {
    updateCartQuantity(productId, Math.min(quantity + 1, stock));
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
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
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => removeFromCart(product.id)}>
                        Retirer
                      </button>
                      {quantity >= product.stock && (
                        <small style={{ color: '#c0392b' }}>Stock maximum atteint</small>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h2>Résumé</h2>
                <div className="summary-row">
                  <span>Articles</span>
                  <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <div className="summary-actions">
                  <button type="button" className="btn btn-danger btn-block" onClick={handleClearCart}>
                    Vider le panier
                  </button>
                  <Link href="/boutique" className="btn btn-outline btn-block">
                    Continuer mes achats
                  </Link>
                </div>

                <div className="checkout-note">
                  <p>Paiement Stripe prêt à connecter quand les clés seront configurées.</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}