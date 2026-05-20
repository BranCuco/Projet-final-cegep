// app/(routes)/admin/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct, Product } from '@/lib/api';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import './admin-products.scss';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;

    setDeletingId(id);
    const success = await deleteProduct(id);

    if (success) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      setError('Erreur lors de la suppression du produit');
    }

    setDeletingId(null);
  };

  return (
    <ProtectedRoute>
      <div className="admin-products-page">
        <div className="container">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1>Gestion des Produits</h1>
              <p>Gérez votre catalogue de produits</p>
            </div>
            <Link href="/admin/products/new" className="btn btn-primary">
              + Ajouter un Produit
            </Link>
          </div>

          {/* Erreurs */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Tableau */}
          {loading ? (
            <div className="loading">Chargement des produits...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>Aucun produit dans le catalogue</p>
              <Link href="/admin/products/new" className="btn btn-primary">
                Créer le premier produit
              </Link>
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="product-name">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-thumb"
                        />
                        <span>{product.name}</span>
                      </td>
                      <td className="product-price">${product.price.toFixed(2)}</td>
                      <td className="product-stock">
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="product-actions">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="btn-action edit"
                        >
                          ✎ Éditer
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="btn-action delete"
                        >
                          {deletingId === product.id ? '...' : '🗑 Supprimer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
