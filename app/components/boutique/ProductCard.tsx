// app/components/boutique/ProductCard.tsx
'use client';

import Link from 'next/link';
import { Product } from '@/lib/api';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stock > 0;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
        />
        {!isAvailable && (
          <div className="product-badge-unavailable">Indisponible</div>
        )}
        {product.stock <= 5 && isAvailable && (
          <div className="product-badge-limited">Stock limité</div>
        )}
      </div>

      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        
        <div className="product-price-stock">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className={`product-stock ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? `${product.stock} en stock` : 'Indisponible'}
          </span>
        </div>

        <Link 
          href={`/boutique/produit/${product.id}`}
          className={`btn btn-primary btn-sm ${!isAvailable ? 'disabled' : ''}`}
        >
          Consulter
        </Link>
      </div>
    </div>
  );
}
