// app/(routes)/admin/products/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/api';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import ProductForm from '@/app/components/admin/ProductForm';
import '../admin-product-form.scss';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData: any) => {
    setIsLoading(true);
    try {
      const result = await createProduct(productData);
      if (result) {
        router.push('/admin/products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="admin-product-form-page">
        <div className="container">
          <div className="form-header">
            <h1>Ajouter un Nouveau Produit</h1>
            <p>Créez un nouveau produit dans votre catalogue</p>
          </div>

          <ProductForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            submitLabel="Créer le Produit"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
