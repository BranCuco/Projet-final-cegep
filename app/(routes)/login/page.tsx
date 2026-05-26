'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, loginAccount } from '@/lib/api';
import '../admin/login/admin-login.scss';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reason = searchParams.get('reason');
  const reasonMessage =
    reason === 'cart'
      ? 'Vous devez vous connecter pour accéder à votre panier.'
      : reason === 'add-to-cart'
        ? 'Vous devez vous connecter pour ajouter un produit au panier.'
        : reason === 'buy-now'
          ? 'Vous devez vous connecter pour acheter ce produit.'
          : reason === 'checkout'
            ? 'Vous devez vous connecter pour passer au paiement.'
            : '';

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/account');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!identifier || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await loginAccount(identifier, password);

    if (!result) {
      setError('Identifiants invalides');
      setPassword('');
      setLoading(false);
      return;
    }

    router.replace(result.roles.includes('Admin') ? '/admin/products' : '/account');
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Accédez à votre compte ou au panneau administrateur</p>

          <form onSubmit={handleSubmit} className="login-form">
            {reasonMessage && <div className="alert alert-error">{reasonMessage}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="identifier">Courriel ou identifiant admin</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Entrez votre courriel ou admin"
                disabled={loading}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Entrez votre mot de passe"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Connexion...' : 'Connexion'}
            </button>
          </form>

          <div className="login-info">
            <p className="info-title">Comptes de test:</p>
            <code>
              <span>Admin: admin / Admin123!</span>
              <span>Client: maria.lopez@techgear.local / User123!</span>
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-page"><div className="login-container"><div className="login-card"><p>Chargement...</p></div></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}