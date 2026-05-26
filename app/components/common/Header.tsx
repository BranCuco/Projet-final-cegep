// app/components/common/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAdminLoggedIn, isAuthenticated, logoutAccount, loadCart } from '@/lib/api';
import { useState, useEffect } from 'react';
import './Header.scss';

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const refreshState = async () => {
      const cart = await loadCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      setIsAdmin(isAdminLoggedIn());
      setIsLoggedIn(isAuthenticated());
    };

    refreshState();

    window.addEventListener('storage', refreshState);
    window.addEventListener('techgear:cart-updated', refreshState);

    return () => {
      window.removeEventListener('storage', refreshState);
      window.removeEventListener('techgear:cart-updated', refreshState);
    };
  }, []);

  const handleLogout = () => {
    logoutAccount();
    setIsAdmin(false);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="logo">
            <img
              src="/techgear-gear.svg"
              alt="TechGear"
              className="logo-image"
            />
            <span className="logo-text">TechGear</span>
          </Link>

          {/* Navegación */}
          <nav className="nav">
            {!isAdminPage && (
              <>
                <Link 
                  href="/boutique" 
                  className={`nav-link ${pathname === '/boutique' ? 'active' : ''}`}
                >
                  Boutique
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin/products" 
                    className="nav-link"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            {isAdminPage && (
              <>
                <span className="nav-label">Panneau Admin</span>
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin/products" 
                      className={`nav-link ${pathname === '/admin/products' ? 'active' : ''}`}
                    >
                      Produits
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="nav-link logout-btn"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Acceso usuario + carrito */}
          {!isAdminPage && (
            <Link href={isLoggedIn ? '/account' : '/login'} className="user-link" aria-label={isLoggedIn ? 'Mon compte' : 'Se connecter'}>
              <span className="user-icon">👤</span>
            </Link>
          )}

          {!isAdminPage && (
            <Link href={isLoggedIn ? '/boutique/cart' : '/login?reason=cart'} className="cart-link" aria-label={isLoggedIn ? 'Panier' : 'Se connecter pour voir le panier'}>
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
