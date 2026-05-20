// app/(routes)/admin/products/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProduct, deleteProduct, Product } from '@/lib/api';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import ProductForm from '@/app/components/admin/ProductForm';
import '../../admin-product-form.scss';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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

  const handleSubmit = async (productData: any) => {
    setIsSubmitting(true);
    try {
      const result = await updateProduct(productId, productData);
      if (result) {
        router.push('/admin/products');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        router.push('/admin/products');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="admin-product-form-page">
          <div className="container">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Chargement du produit...
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !product) {
    return (
      <ProtectedRoute>
        <div className="admin-product-form-page">
          <div className="container">
            <div className="alert alert-error">{error || 'Produit non trouvé'}</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="admin-product-form-page">
        <div className="container">
          <div className="form-header">
            <h1>Éditer le Produit</h1>
            <p>{product.name}</p>
          </div>

          <ProductForm 
            initialProduct={product}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Enregistrer les Modifications"
          />

          {/* Section Suppression */}
          <div className="delete-section">
            <h3>Zone de Danger</h3>
            <p>Supprimer ce produit définitivement</p>
            
            {deleteConfirm && (
              <div className="alert alert-warning">
                ⚠️ Êtes-vous sûr? Cette action est irréversible.
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className={`btn btn-danger btn-lg ${deleteConfirm ? 'confirm' : ''}`}
            >
              {isSubmitting ? 'Suppression...' : deleteConfirm ? 'Confirmer la Suppression' : '🗑 Supprimer le Produit'}
            </button>

            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
