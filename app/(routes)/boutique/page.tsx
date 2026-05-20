// app/(routes)/boutique/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getProducts, searchProducts, Product } from '@/lib/api';
import ProductCard from '@/app/components/boutique/ProductCard';
import './boutique.scss';

export default function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilteredProducts(searchProducts(products, query));
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <div className="boutique-page">
      {/* Hero */}
      <section className="boutique-hero">
        <div className="container">
          <h1>Boutique</h1>
          <p>Découvrez notre sélection complète de produits</p>
        </div>
      </section>

      {/* Barre de Recherche */}
      <section className="search-section">
        <div className="container">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          {searchQuery && (
            <p className="search-result-count">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Produits */}
      <section className="products-section">
        <div className="container">
          {loading && (
            <div className="loading">Chargement des produits...</div>
          )}

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="no-products">
              <p>Aucun produit trouvé</p>
              {searchQuery && (
                <button 
                  onClick={() => handleSearch('')}
                  className="btn btn-outline"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
