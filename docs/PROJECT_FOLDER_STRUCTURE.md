# Estructura de carpetas — Projet-final-cegep

Este documento muestra el árbol principal del proyecto y una breve descripción de carpetas y archivos relevantes.

```
Projet-final-cegep/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── . . . (otros archivos de configuración)
├── app/
│   ├── globals.css
│   ├── home.scss
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (routes)/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   ├── admin-login.scss
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── admin-product-form.scss
│   │   │   │   ├── admin-products.scss
│   │   │   │   └── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   └── users/page.tsx
│   │   └── boutique/
│   │       ├── boutique.scss
│   │       ├── page.tsx
│   │       ├── cart/
│   │       │   ├── cart.scss
│   │       │   └── page.tsx
│   │       └── produit/
│   │           └── [id]/
│   │               ├── page.tsx
│   │               └── product-detail.scss
│   └── components/
│       ├── admin/
│       │   ├── ProductForm.scss
│       │   ├── ProductForm.tsx
│       │   └── ProtectedRoute.tsx
│       ├── boutique/
│       │   ├── ProductCard.scss
│       │   └── ProductCard.tsx
│       └── common/
│           ├── Footer.scss
│           ├── Footer.tsx
│           ├── Header.scss
│           └── Header.tsx
├── docs/
│   ├── CONCEPTION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── PROJECT_FOLDER_STRUCTURE.md   <-- este archivo
│   └── QUICK_START.md
├── lib/
│   └── api.ts
├── public/
├── styles/
│   └── scss/
│       ├── _variables.scss
│       └── globals.scss
├── backend/
│   └── TechGear.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── scripts/
│       └── TechGear.Api.csproj
└── other/
    └── (scripts, configs, etc.)
```

Notas rápidas:
- La aplicación front-end usa Next.js con el App Router (`app/`).
- El backend está en `backend/TechGear.Api` (API ASP.NET Core + EF Core).
- `lib/api.ts` contiene helpers para llamadas a la API desde el frontend.
- Eliminé `db.json` y la dependencia `json-server` del proyecto.

Si quieres, genero una versión más detallada (incluyendo líneas exactas y enlaces a archivos), o la exporto al root como `PROJECT_FOLDER_STRUCTURE.md`. 
