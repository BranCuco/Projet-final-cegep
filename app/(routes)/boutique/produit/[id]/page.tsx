// app/(routes)/boutique/produit/[id]/page.tsx
"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCart, getProductById, addToCart, Product } from "@/lib/api";
import "./product-detail.scss";

function renderStars(rating: number): string {
  const normalized = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(normalized) + "☆".repeat(5 - normalized);
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (!data) {
          setError("Produit non trouvé");
        } else {
          setProduct(data);
          setMainImage(data.image ?? null);
        }
      } catch (err) {
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const currentQuantity = getCart().find((item) => String(item.productId) === String(product.id))?.quantity ?? 0;

      if (currentQuantity + quantity > product.stock) {
        // prevent exceeding stock
        return;
      }

      addToCart(product.id, quantity, product.stock);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleCheckout = async () => {
    if (!product || isCheckingOut) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: product.id, quantity }],
        }),
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
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-section">
            <h2>Produit non trouvé</h2>
            <p>{error || "Le produit que vous recherchez n'existe pas."}</p>
            <Link href="/boutique" className="btn btn-primary">
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = product.stock > 0;
  const currentQuantityInCart = getCart().find((item) => String(item.productId) === String(product.id))?.quantity ?? 0;
  const stockReached = currentQuantityInCart >= product.stock;
  const reviews = product.reviews ?? [];
  const computedAverage = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const rating = product.rating ?? computedAverage;
  const reviewCount = product.reviewCount ?? reviews.length;

  // image set (support product.images array if available)
  const images = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

  const maxSelectable = Math.max(1, product.stock - currentQuantityInCart);

  const handleImageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/boutique">← Retour à la boutique</Link>
        </div>

        <div className="product-detail-container amazon-style">
          {/* Gallery (left) */}
          <div className="gallery-column">
            <div className="thumbnails">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  className={`thumb ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                  aria-label={`Voir l'image ${idx + 1}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
            <div className="main-image">
              <div
                className="zoom-wrapper"
                onMouseMove={handleImageMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <img
                  src={mainImage ?? product.image}
                  alt={product.name}
                  className={isZooming ? "zoomed" : ""}
                  style={{ transformOrigin: zoomOrigin }}
                />
              </div>
              {!isAvailable && <div className="unavailable-overlay">Indisponible</div>}
            </div>
          </div>

          {/* Main info (center) */}
          <div className="product-main-info">
            <h1>{product.name}</h1>

            <div className="summary">
              <div className="rating-block" aria-label={`Note ${rating.toFixed(1)} sur 5`}>
                <span className="stars">{renderStars(rating)}</span>
                <span className="rating-value">{rating.toFixed(1)}</span>
                <span className="review-count">({reviewCount} avis)</span>
              </div>
              <div className="short-desc">{product.shortDescription ?? ""}</div>
              <div className="zoom-hint">Survolez l'image pour zoomer</div>
            </div>

            <div className="description">
              <h3>Description du produit</h3>
              <p>{product.description}</p>
            </div>
          </div>

          {/* Purchase panel (right) */}
          <aside className="purchase-panel">
            <div className="panel-inner">
              <div className="price-row">
                <div className="price">${product.price.toFixed(2)}</div>
                <div className="savings">{product.savings ? `${product.savings} off` : ""}</div>
              </div>

              <div className="delivery">Livraison: Livraison standard disponible</div>

              <div className="stock-row">
                <span className={`stock-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                  {isAvailable ? `${product.stock} en stock` : 'Indisponible'}
                </span>
              </div>

              {isAvailable && (
                <div className="purchase-controls">
                  <label htmlFor="quantity">Quantity:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleAddToCart}
                    className={`btn btn-primary btn-lg ${addedToCart ? 'added' : ''}`}
                    disabled={stockReached || quantity <= 0}
                  >
                    {stockReached ? 'Stock atteint' : addedToCart ? '✓ Ajouté au panier' : 'Ajouter au Panier'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-lg"
                    onClick={handleCheckout}
                    disabled={stockReached || quantity <= 0 || isCheckingOut}
                  >
                    {isCheckingOut ? 'Redirection vers Stripe...' : 'Acheter Maintenant'}
                  </button>
                </div>
              )}

              {checkoutError && (
                <div className="alert alert-error small">{checkoutError}</div>
              )}

              {product.stock <= 5 && product.stock > 0 && (
                <div className="alert alert-warning small">⚠️ Stock limité: il ne reste que {product.stock}</div>
              )}
            </div>
          </aside>
        </div>

        <section className="reviews-section">
          <h2>Avis des clients</h2>
          <div className="reviews-list">
            {reviews.length > 0 ? reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.author}</strong>
                  <span className="review-date">{review.date}</span>
                </div>
                <div className="review-stars">{renderStars(review.rating)}</div>
                <p>{review.comment}</p>
              </article>
            )) : (
              <p>Aucun avis pour ce produit pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
