# 🛍️ TechGear Shop - Boutique Frontend

Une boutique en ligne transactionnelle moderna construite avec **Next.js**, **React**, **TypeScript**, **Bootstrap**, **SASS**, **Stripe** et **JSON Server**.

## 📋 Table des Matières

- [Caractéristiques](#caractéristiques)
- [Technologies](#technologies)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Développement](#développement)
- [Configuration](#configuration)
- [API](#api)
- [Authentification Admin](#authentification-admin)
- [Déploiement](#déploiement)

---

## ✨ Caractéristiques

### Section Boutique
- ✅ Liste de produits avec recherche en temps réel
- ✅ Consultation détaillée des produits
- ✅ Panier d'achat (localStorage)
- ✅ Paiement sécurisé avec Stripe
- ✅ Pagination et filtres

### Section Administration
- ✅ Authentification admin (admin/Admin123!)
- ✅ Gestion CRUD complète des produits
- ✅ Édition/Suppression de produits
- ✅ Routes protégées côté client
- ✅ Interface utilisateur intuitive

### Design & UX
- ✅ Design responsive (mobile-first)
- ✅ Palette de couleurs professionnelle
- ✅ Animations fluides
- ✅ Accessibilité (WCAG)
- ✅ Performance optimisée

---

## 🛠️ Technologies

| Technologie | Utilisation |
|-------------|------------|
| **Next.js 16** | Framework React avec SSR/SSG |
| **React 19** | Composants UI réactifs |
| **TypeScript** | Typage statique |
| **Bootstrap 5** | Framework CSS responsive |
| **SASS** | Styles modulaires et réutilisables |
| **Stripe** | Paiements sécurisés |
| **JSON Server** | API REST simulée |
| **jQuery 4** | Optionnel pour interactivité DOM |
| **Tailwind CSS** | Utilities CSS supplémentaires |

---

## 📁 Structure du Projet

```
projet_final/
├── app/
│   ├── (routes)/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── products/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       └── [id]/edit/
│   │   └── boutique/
│   │       ├── page.tsx
│   │       ├── produit/[id]/
│   │       └── checkout/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.scss
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.scss
│   │   ├── boutique/
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductCard.scss
│   │   └── admin/
│   │       ├── ProtectedRoute.tsx
│   │       ├── ProductForm.tsx
│   │       └── ProductForm.scss
│   ├── layout.tsx
│   ├── page.tsx
│   ├── home.scss
│   └── globals.css
├── lib/
│   └── api.ts              # Fonctions utilitaires pour API
├── styles/
│   └── scss/
│       ├── _variables.scss # Couleurs, variables
│       └── globals.scss    # Styles globaux
├── docs/
│   └── CONCEPTION.md       # Document de conception
├── public/
│   └── ...
├── db.json                 # Base de données JSON Server
├── .env.example            # Variables d'environnement
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## 💻 Installation

### Prérequis
- **Node.js** 18.17+ 
- **npm** 9+ ou **yarn**

### Étapes

1. **Cloner le repo**
   ```bash
   git clone <repo-url>
   cd projet_final
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Modifier `.env.local` avec vos clés Stripe:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

4. **Vérifier l'installation**
   ```bash
   npm run build
   ```

---

## 🚀 Développement

### Démarrer les serveurs

```bash
# Option 1: Next.js et JSON Server séparément
npm run dev              # Next.js sur http://localhost:3000
npm run server           # JSON Server sur http://localhost:3001

# Option 2: Les deux en parallèle
npm run dev:full
```

### Navigation

- **Boutique**: http://localhost:3000/boutique
- **Admin (Login)**: http://localhost:3000/admin/login
- **JSON Server**: http://localhost:3001

---

## 🔧 Configuration

### Authentification Admin

**Identifiants par défaut:**
```
Utilisateur: admin
Mot de passe: Admin123!
```

Modifier dans `lib/api.ts`:
```typescript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';
```

### Palette de Couleurs

Modifier `styles/scss/_variables.scss`:
```scss
$primary: #2C3E50;      // Gris-bleu foncé
$secondary: #3498DB;    // Bleu électrique
$accent: #E74C3C;       // Rouge énergique
$success: #27AE60;      // Vert
```

### Typographie

Polices Google Fonts importées dans `app/layout.tsx`:
- **Poppins** (titres)
- **Inter** (corps)

---

## 📡 API

### Endpoints JSON Server

```bash
GET    /products           # Tous les produits
GET    /products/:id       # Produit spécifique
POST   /products           # Créer un produit
PUT    /products/:id       # Modifier un produit
DELETE /products/:id       # Supprimer un produit
```

### Fonctions Utilitaires (`lib/api.ts`)

```typescript
// Produits
getProducts()              // Récupère tous les produits
getProductById(id)         // Récupère un produit
createProduct(data)        // Crée un produit
updateProduct(id, data)    // Modifie un produit
deleteProduct(id)          // Supprime un produit

// Recherche
searchProducts(products, query)

// Panier
getCart()                  // Récupère le panier
addToCart(productId, qty)  // Ajoute au panier
removeFromCart(productId)  // Retire du panier
clearCart()                // Vide le panier

// Admin
loginAdmin(user, pass)     // Connexion
isAdminLoggedIn()          // Vérification
logoutAdmin()              // Déconnexion

// Validation
validateProduct(data)      // Valide un produit
```

---

## 🔐 Authentification Admin

### Flux de Sécurité

1. L'utilisateur se connecte sur `/admin/login`
2. Les identifiants sont vérifiés
3. Un token est stocké dans `localStorage`
4. Les routes protégées vérifient le token
5. Redirection vers `/admin/login` si non autorisé

### Routes Protégées

```typescript
// Exemple d'utilisation
<ProtectedRoute>
  <AdminProductsPage />
</ProtectedRoute>
```

---

## 💳 Intégration Stripe

### Setup

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés de test
3. Ajouter à `.env.local`

### Utilisation

```tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      {/* Vos composants de paiement */}
    </Elements>
  );
}
```

---

## 🎨 Personnalisation

### Ajouter un Produit

Via l'interface admin:
1. Connectez-vous: `admin/Admin123!`
2. Allez à `/admin/products`
3. Cliquez "+ Ajouter un Produit"
4. Remplissez le formulaire

Via JSON Server:
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau Produit",
    "price": 99.99,
    "description": "...",
    "image": "https://...",
    "stock": 10
  }'
```

### Modifier les Styles SASS

Les styles sont organisés en modules SCSS:
- `styles/scss/_variables.scss` - Variables et mixins
- `styles/scss/globals.scss` - Styles globaux
- `app/**/*.scss` - Styles par composant

---

## 📦 Scripts NPM

```bash
npm run dev          # Démarrer Next.js en dev
npm run server       # Démarrer JSON Server
npm run dev:full     # Les deux en parallèle

npm run build        # Compiler pour production
npm start            # Démarrer en production

npm run lint         # Vérifier le code ESLint
```

---

## 🧪 Tests

```bash
# Tester la recherche de produits
# Aller à /boutique et chercher un produit

# Tester l'admin
# Aller à /admin/login
# Identifiants: admin / Admin123!

# Tester le panier
# Ajouter des produits et voir l'icône du panier
```

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Netlify

```bash
# Build Next.js
npm run build

# Déployer le dossier .next
netlify deploy --prod
```

### Variables d'Environnement (Production)

Ajouter à votre plateforme de déploiement:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

---

## 📱 Responsive Design

Le projet est entièrement responsive avec breakpoints Bootstrap:
- **xs** (0px) - Mobile
- **sm** (576px) - Petit écran
- **md** (768px) - Tablette
- **lg** (992px) - Desktop
- **xl** (1200px) - Large screen
- **2xl** (1400px) - Extra large

---

## 🔍 Performance

- **Code Splitting**: Automatique avec Next.js
- **Image Optimization**: Next/Image
- **SCSS Minification**: Automatique
- **Tree Shaking**: ES6 modules
- **Lazy Loading**: Routes et composants

---

## 🐛 Dépannage

### Port 3000 déjà utilisé
```bash
# Utiliser un port différent
npm run dev -- -p 3001
```

### Port 3001 déjà utilisé (JSON Server)
```bash
npm run server -- --port 3002
```

### SASS erreurs
- Assurez-vous que les fichiers utilisent `.scss`
- Vérifiez les imports avec `@import`

### Stripe erreurs
- Vérifiez les clés dans `.env.local`
- Utilisez les clés de **test** (commencent par `pk_test_`)

---

## 📝 Licence

Projet éducatif - Tous droits réservés

---

## 📧 Support

Pour toute question, consultez la documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Stripe Docs](https://stripe.com/docs)
- [Bootstrap Docs](https://getbootstrap.com/docs)

---

**Version**: 1.0.0  
**Dernière mise à jour**: 20 mai 2026

## Descripción

Este proyecto está configurado con las siguientes tecnologías:
- **Next.js 16** - Framework React con renderizado del lado del servidor
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Bootstrap 5** - Framework CSS
- **SASS** - Preprocesador CSS
- **jQuery 4** - Librería de manipulación del DOM
- **Stripe** - Procesamiento de pagos
- **JSON Server** - API REST falsa para desarrollo
- **Tailwind CSS** - Framework CSS utilities

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## Estructura del Proyecto

```
.
├── app/                 # Directorio de aplicación Next.js
├── public/              # Archivos estáticos
├── styles/              # Archivos SASS/CSS
├── db.json             # Base de datos de JSON Server
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración de TypeScript
├── next.config.ts      # Configuración de Next.js
└── tailwind.config.ts  # Configuración de Tailwind
```

## Scripts Disponibles

### Desarrollo

```bash
# Ejecutar solo Next.js en modo desarrollo
npm run dev

# Ejecutar solo JSON Server
npm run server

# Ejecutar Next.js y JSON Server simultáneamente
npm run dev:full
```

### Producción

```bash
# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

### Otros

```bash
# Ejecutar linter
npm run lint
```

## JSON Server

JSON Server proporciona una API REST falsa basada en el archivo `db.json`.

**Puerto por defecto:** `3001`

### Endpoints disponibles

- `GET /posts` - Obtener todos los posts
- `POST /posts` - Crear un nuevo post
- `GET /posts/:id` - Obtener un post específico
- `PUT /posts/:id` - Actualizar un post
- `DELETE /posts/:id` - Eliminar un post
- `GET /users` - Obtener todos los usuarios
- `GET /products` - Obtener todos los productos

Puedes modificar `db.json` para agregar más datos o endpoints.

## Stripe

Para usar Stripe:

1. Obtén tus claves de API en https://dashboard.stripe.com
2. Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

3. Usa el componente `Elements` de Stripe en tus páginas:

```tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      {/* Tu componente de pago aquí */}
    </Elements>
  );
}
```

## Bootstrap + SASS

Puedes usar Bootstrap de dos formas:

### Opción 1: CDN (Simple)
```tsx
// En tu componente
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Button() {
  return <button className="btn btn-primary">Click me</button>;
}
```

### Opción 2: SASS (Recomendado)
Crea archivos `.scss` en tu directorio `styles/`:

```scss
// styles/custom.scss
@import 'bootstrap/scss/bootstrap';

.custom-class {
  color: #333;
}
```

## jQuery

Aunque jQuery está instalado, se recomienda usar React en lugar de jQuery para manipular el DOM:

```tsx
// ✅ Recomendado
import { useState } from 'react';

export default function Component() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>{count}</div>;
}

// ❌ No recomendado con React
import $ from 'jquery';
```

Si necesitas jQuery para algo específico:

```tsx
import $ from 'jquery';

useEffect(() => {
  $('#myElement').addClass('active');
}, []);
```

## Desarrollo

Para desarrollar con todas las herramientas:

```bash
npm run dev:full
```

Esto abrirá:
- **Next.js**: http://localhost:3000
- **JSON Server**: http://localhost:3001

## Solución de Problemas

### Error de puerto en uso
Si los puertos 3000 o 3001 ya están en uso, puedes cambiarlos en los scripts del `package.json`.

### SASS no compila
Asegúrate de que los archivos usen la extensión `.scss` o `.sass`.

### jQuery no funciona
Asegúrate de importar jQuery como módulo: `import $ from 'jquery'`.

---

¡Listo para comenzar! 🚀
