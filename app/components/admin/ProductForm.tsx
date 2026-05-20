// app/components/admin/ProductForm.tsx
'use client';

import { useState } from 'react';
import { Product, validateProduct } from '@/lib/api';
import './ProductForm.scss';

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ProductForm({
  initialProduct,
  onSubmit,
  isLoading = false,
  submitLabel = 'Enregistrer',
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    price: initialProduct?.price || 0,
    description: initialProduct?.description || '',
    image: initialProduct?.image || '',
    stock: initialProduct?.stock || 0,
    category: initialProduct?.category || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validar
    const validation = validateProduct(formData);
    if (!validation.valid) {
      const newErrors: { [key: string]: string } = {};
      validation.errors.forEach((error) => {
        const field = error.split(' ')[0].toLowerCase();
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {submitError && (
        <div className="alert alert-error">{submitError}</div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nom du Produit *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Processeur Intel Core i9"
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Prix ($) *</label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isLoading}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock *</label>
          <input
            id="stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            min="0"
            disabled={isLoading}
          />
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Catégorie</label>
          <input
            id="category"
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ex: Électronique"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez le produit en détail..."
          rows={6}
          disabled={isLoading}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="image">URL de l'Image *</label>
        <input
          id="image"
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://exemple.com/image.jpg"
          disabled={isLoading}
        />
        {errors.image && <span className="error-message">{errors.image}</span>}

        {formData.image && (
          <div className="image-preview">
            <img src={formData.image} alt="Aperçu" />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
