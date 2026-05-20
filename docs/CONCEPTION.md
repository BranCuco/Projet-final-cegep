# 📋 Document de Conception - BOUTIQUE FRONTEND

## 🏢 Informations Générales

**Nom de l'entreprise :** TechGear Shop  
**Logo :** [À créer - icône engrenage + panier]  
**Secteur :** Vente en ligne de matériel informatique et accessoires technologiques  
**Date de conception :** 20 mai 2026

---

## 🎨 Identité Visuelle

### Palette de Couleurs

```
Couleur primaire :     #2C3E50 (Gris-bleu foncé)
Couleur secondaire :   #3498DB (Bleu électrique)
Couleur d'accent :     #E74C3C (Rouge énergique)
Couleur de succès :    #27AE60 (Vert)
Couleur d'avertissement: #F39C12 (Orange)
Couleur de fond :      #ECF0F1 (Gris clair)
Couleur texte :        #2C3E50 (Gris-bleu foncé)
Blanc :                #FFFFFF
```

**Justification :** 
- Palette professionnelle et moderne
- Contraste suffisant pour accessibilité
- Couleurs associées à la technologie et la confiance
- Bon support pour e-commerce

### Typographie

**Police Principale (Titres) :** Poppins (Google Fonts)
- Poids : Bold (700) pour les titres principaux
- Poids : SemiBold (600) pour les sous-titres

**Police Secondaire (Corps de texte) :** Inter (Google Fonts)
- Poids : Regular (400) pour le corps
- Poids : Medium (500) pour les emphases

**Tailles :**
- H1 : 48px (titres de page)
- H2 : 36px (sections)
- H3 : 28px (sous-sections)
- H4 : 24px (titres de cartes)
- Texte du corps : 16px
- Texte petit : 14px

**Justification :** Polices modernes, lisibles sur tous les appareils, chargement rapide

---

## 📱 Croquis de la Structure des Pages

### 1. Layout Principal (Header & Footer)

```
┌─────────────────────────────────────────────┐
│ HEADER                                       │
│ Logo | Boutique | Admin | Panier (icône)   │
├─────────────────────────────────────────────┤
│                                              │
│              CONTENU PRINCIPAL               │
│                                              │
├─────────────────────────────────────────────┤
│ FOOTER                                       │
│ © 2026 TechGear Shop | Mentions légales    │
└─────────────────────────────────────────────┘
```

### 2. Page Principale (Boutique)

```
┌──────────────────────────────────────────────┐
│ HEADER (Navigation)                          │
├──────────────────────────────────────────────┤
│ 🔍 Barre de recherche                       │
├──────────────────────────────────────────────┤
│  Produit 1     │  Produit 2    │  Produit 3 │
│  [Image]       │  [Image]      │  [Image]   │
│  Nom           │  Nom          │  Nom       │
│  Prix: $XX.XX  │  Prix: $XX.XX │  Prix: $XX │
│  ✓ Disponible  │  ✗ Indisponib │  ✓ Dispon │
│  [Consulter]   │  [Consulter]  │  [Consulte│
├─────────────────────────────────────────────┤
│        Pagination (1 2 3 ... Suivant)        │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

### 3. Page Détails du Produit

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
├──────────────────────────────────────────────┤
│                                              │
│  [Retour à la boutique]                     │
│                                              │
│  [  Image du produit  ]   Nom du produit    │
│                           Prix: $XX.XX       │
│                           ✓ 15 en stock     │
│                           Description...    │
│                           [Acheter]         │
│                           [Ajouter au panier]│
│                                              │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

### 4. Page de Paiement (Stripe)

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
├──────────────────────────────────────────────┤
│            FINALISATION DE COMMANDE          │
│                                              │
│  Produit 1 x 2 ..................... $XX.XX │
│  Produit 2 x 1 ..................... $XX.XX │
│  ─────────────────────────────────────────  │
│  Total ............................. $XX.XX │
│                                              │
│  Informations de paiement (Stripe)           │
│  [Champs de carte]                          │
│  [Bouton Payer avec Stripe]                 │
│                                              │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

### 5. Page Administration - Connexion

```
┌──────────────────────────────────────────────┐
│              PANNEAU ADMINISTRATEUR          │
│                                              │
│  Utilisateur: [_____________]                │
│  Mot de passe: [_____________]               │
│                                              │
│              [Connexion] [Annuler]           │
│                                              │
└──────────────────────────────────────────────┘
```

### 6. Page Administration - Gestion des Produits

```
┌──────────────────────────────────────────────┐
│ ADMIN HEADER                                 │
│ Logo | Produits | [Déconnexion]             │
├──────────────────────────────────────────────┤
│ Tableau des produits:                        │
│                                              │
│ Produit    │ Prix  │ Stock │ Actions        │
│ ───────────┼───────┼───────┼────────────    │
│ Produit 1  │ $XX   │  15   │ [Éditer]       │
│ Produit 2  │ $XX   │  0    │ [Éditer]       │
│ ...                                          │
│                                              │
│ [+ Ajouter un produit]                      │
│                                              │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

### 7. Page Administration - Édition/Création de Produit

```
┌──────────────────────────────────────────────┐
│ ADMIN HEADER                                 │
├──────────────────────────────────────────────┤
│ Ajouter / Éditer un produit                  │
│                                              │
│ Nom: [_________________]                     │
│ Prix: [_________________]                    │
│ Description: [_________________]             │
│ Image URL: [_________________]               │
│ Stock: [_________________]                   │
│                                              │
│ [Enregistrer]  [Annuler]  [Supprimer]*      │
│ *Suppression seulement en édition            │
│                                              │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

---

## 🔄 Flux de Navigation

### Boutique
```
Page Principale
    ├─> Consulter Produit
    │   ├─> Acheter (Stripe)
    │   │   └─> Confirmation de paiement
    │   └─> Retour à Boutique
    └─> Recherche/Filtrage
```

### Administration
```
Connexion Admin
    ├─> Liste Produits
    │   ├─> Éditer Produit
    │   │   ├─> Enregistrer
    │   │   ├─> Supprimer
    │   │   └─> Retour
    │   └─> Ajouter Produit
    │       └─> Enregistrer
    └─> Déconnexion
```

---

## 🔐 Sécurité

### Authentication Admin
- **Utilisateur :** `admin`
- **Mot de passe :** `Admin123!`
- **Méthode :** Session localStorage (simple) ou JWT
- **Protection :** Routes protégées côté client, validation serveur recommandée

---

## 📦 Technologies & Justification

| Tech | Utilisation | Justification |
|------|-------------|---------------|
| **Next.js** | Framework principal | SSR, routing, performance |
| **React** | Composants UI | Réactivité, réutilisabilité |
| **Bootstrap** | Mise en page responsive | Grille, composants pré-stylés |
| **SASS** | Styles personnalisés | Variables, mixins, imbrication |
| **Stripe** | Paiements sécurisés | Standard industrie, PCI compliant |
| **JSON Server** | Mock API | Développement rapide |
| **jQuery** | Interactions DOM (optionnel) | Compatibilité legacy |

---

## 🎯 Objectifs de Conception

1. ✅ **Accessibilité** - Contraste, navigation au clavier
2. ✅ **Responsive** - Mobile-first, tous les appareils
3. ✅ **Performance** - Images optimisées, code splitting
4. ✅ **UX** - Navigation intuitive, feedback utilisateur
5. ✅ **Sécurité** - Admin protégé, HTTPS (prod), validation

---

## 📐 Grille Bootstrap

Utilisation de la grille Bootstrap standard:
- **12 colonnes** sur desktop
- **Breakpoints :** xs (mobile), sm, md, lg (desktop), xl (wide)
- **Spacing :** Système de classes (m-*, p-*)

---

## 🚀 Points clés de l'implémentation

1. **Réactivité maximale** avec React Hooks
2. **API REST** via JSON Server et Fetch
3. **Paiements sécurisés** via Stripe Elements
4. **Persistence** localStorage pour panier (MVP)
5. **Admin protégé** par simple auth (prod: JWT)

---

**Date de finalisation de la conception :** 20 mai 2026
