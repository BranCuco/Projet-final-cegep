// app/components/common/Footer.tsx
'use client';

import './Footer.scss';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>À Propos</h4>
            <p>TechGear Shop - Votre destination pour les meilleurs produits technologiques.</p>
          </div>

          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <ul>
              <li><a href="/">Accueil</a></li>
              <li><a href="/boutique">Boutique</a></li>
              <li><a href="/admin/login">Admin</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@techgear.com</p>
            <p>Téléphone: +1 (555) 123-4567</p>
          </div>

          <div className="footer-section">
            <h4>Légal</h4>
            <ul>
              <li><a href="#privacy">Politique de Confidentialité</a></li>
              <li><a href="#terms">Conditions d'Utilisation</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 TechGear Shop. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
