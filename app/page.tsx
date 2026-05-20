// app/page.tsx
'use client';

import Link from 'next/link';
import './home.scss';

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Bienvenue chez TechGear Shop</h1>
            <p className="hero-subtitle">
              Découvrez la meilleure sélection de produits technologiques
            </p>
            <Link href="/boutique" className="btn btn-primary btn-lg">
              Commencer à Magasiner
            </Link>
          </div>
          <div className="hero-image">
            <span className="hero-emoji">🛍️</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Pourquoi Choisir TechGear?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Livraison Rapide</h3>
              <p>Expédition express pour tous les produits</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3>Paiement Sécurisé</h3>
              <p>Transactions cryptées avec Stripe</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📞</span>
              <h3>Support Client</h3>
              <p>Assistance disponible 24h/24</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>Garantie Produits</h3>
              <p>Tous nos produits sont garantis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Prêt à Commencer?</h2>
          <p>Parcourez notre sélection de produits premium</p>
          <Link href="/boutique" className="btn btn-primary btn-lg">
            Visiter la Boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
