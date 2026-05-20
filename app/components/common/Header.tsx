// app/components/common/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAdminLoggedIn, logoutAdmin, getCart } from '@/lib/api';
import { useState, useEffect } from 'react';
import './Header.scss';

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const refreshState = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      setIsAdmin(isAdminLoggedIn());
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
    logoutAdmin();
    setIsAdmin(false);
    window.location.href = '/';
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="logo-icon">⚙️</span>
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
                <Link 
                  href="/admin/login" 
                  className="nav-link"
                >
                  Admin
                </Link>
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

          {/* Carrito (solo en boutique) */}
          {!isAdminPage && (
            <Link href="/boutique/cart" className="cart-link">
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
