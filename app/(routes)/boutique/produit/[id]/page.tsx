// app/(routes)/boutique/produit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCart, getProductById, addToCart, Product } from '@/lib/api';
import './product-detail.scss';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (!data) {
          setError('Produit non trouvé');
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const currentQuantity = getCart().find((item) => String(item.productId) === String(product.id))?.quantity ?? 0;

      if (currentQuantity >= product.stock) {
        return;
      }

      addToCart(product.id, 1, product.stock);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
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
            <p>{error || 'Le produit que vous recherchez n\'existe pas.'}</p>
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

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Navigation */}
        <div className="breadcrumb">
          <Link href="/boutique">← Retour à la boutique</Link>
        </div>

        {/* Détails du Produit */}
        <div className="product-detail-container">
          {/* Image */}
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
            {!isAvailable && (
              <div className="unavailable-overlay">Indisponible</div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <h1>{product.name}</h1>

            <div className="product-meta">
              <div className="price-section">
                <span className="price">${product.price.toFixed(2)}</span>
              </div>

              <div className="stock-section">
                <span className={`stock-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                  {isAvailable ? `${product.stock} en stock` : 'Indisponible'}
                </span>
              </div>
            </div>

            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Actions */}
            <div className="actions">
              {isAvailable ? (
                <>
                  <button 
                    onClick={handleAddToCart}
                    className={`btn btn-primary btn-lg ${addedToCart ? 'added' : ''}`}
                    disabled={stockReached}
                  >
                    {stockReached ? 'Stock atteint' : addedToCart ? '✓ Ajouté au panier' : 'Ajouter au Panier'}
                  </button>
                  <Link 
                    href="/boutique/cart" 
                    className="btn btn-success btn-lg"
                    onClick={() => handleAddToCart()}
                  >
                    Acheter Maintenant
                  </Link>
                </>
              ) : (
                <button className="btn btn-primary btn-lg" disabled>
                  Indisponible
                </button>
              )}
            </div>

            {product.stock <= 5 && product.stock > 0 && (
              <div className="alert alert-warning">
                ⚠️ Stock limité! Il ne reste que {product.stock} produit{product.stock !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
