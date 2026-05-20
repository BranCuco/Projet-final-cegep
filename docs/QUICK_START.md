# ⚡ Quick Start - TechGear Shop

## 🚀 Para Comenzar Ahora Mismo

### 1. Instalar y Ejecutar

```bash
# Las dependencias ya están instaladas
# Solo ejecuta:
npm run dev:full
```

Esto abrirá:
- **Boutique Frontend**: http://localhost:3000
- **API REST (JSON Server)**: http://localhost:3001

### 2. Navegación

**Boutique (Cliente):**
- Página principal: `/`
- Lista de productos: `/boutique`
- Detalles del producto: `/boutique/produit/:id`

**Admin (Administrador):**
- Login: `/admin/login`
- Gestión de productos: `/admin/products`
- Nuevo producto: `/admin/products/new`
- Editar producto: `/admin/products/:id/edit`

### 3. Credenciales Admin

```
Usuario: admin
Contraseña: Admin123!
```

### 4. Estructura de Carpetas Clave

```
app/
├── (routes)/
│   ├── admin/          ← Panel administrativo (protegido)
│   └── boutique/       ← Sección de compras
├── components/
│   ├── common/         ← Header, Footer
│   ├── boutique/       ← ProductCard
│   └── admin/          ← ProductForm, ProtectedRoute
lib/
└── api.ts              ← Todas las funciones de API

styles/scss/
├── _variables.scss     ← Colores, variables SASS
└── globals.scss        ← Estilos globales

docs/
└── CONCEPTION.md       ← Documento completo de diseño
```

---

## 🎨 Características Implementadas

### ✅ Boutique
- [x] Página principal con hero
- [x] Lista de productos con búsqueda
- [x] Detalles del producto
- [x] Panier d'achat (localStorage)
- [x] Página de paiement (Stripe ready)
- [x] Diseño responsivo

### ✅ Administración
- [x] Autenticación simple (admin/Admin123!)
- [x] Listar productos
- [x] Agregar nuevos productos
- [x] Editar productos
- [x] Eliminar productos
- [x] Formulario de validación
- [x] Rutas protegidas

### ✅ Tecnología
- [x] Next.js 16 + React 19
- [x] TypeScript
- [x] Bootstrap 5 + SASS
- [x] JSON Server (8 productos de ejemplo)
- [x] Stripe Integration Ready
- [x] jQuery (instalado, opcional)

---

## 📝 Editar Datos de Productos

### Opción 1: Usando el Admin

1. Ve a `http://localhost:3000/admin/login`
2. Ingresa: `admin` / `Admin123!`
3. Haz clic en "+ Ajouter un Produit"
4. Completa el formulario
5. Los cambios se guardan en `db.json` automáticamente

### Opción 2: Editar db.json Directamente

Edita `db.json` y reinicia JSON Server:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Tu Producto",
      "price": 99.99,
      "description": "Descripción...",
      "image": "https://...",
      "stock": 10,
      "category": "Electrónica"
    }
  ]
}
```

---

## 🎯 Próximos Pasos

### Para Completar la Integración Stripe:

1. **Crear cuenta Stripe**: https://stripe.com
2. **Obtener claves de test**
3. **Actualizar `.env.local`**:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. **Implementar página de checkout** (`app/(routes)/boutique/checkout/page.tsx`)

### Para Mejorar la Seguridad Admin:

- [ ] Migrar a JWT tokens
- [ ] Hasear contraseñas
- [ ] Agregar sesiones seguras
- [ ] Validación servidor-side

### Para Producción:

- [ ] Conectar a API backend real
- [ ] Migrar a BD (MongoDB, PostgreSQL, etc.)
- [ ] Agregar más validaciones
- [ ] Implementar logging
- [ ] Configurar HTTPS
- [ ] Agregar rate limiting
- [ ] Tests automatizados

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Solo Next.js
npm run server           # Solo JSON Server
npm run dev:full         # Ambos juntos

# Producción
npm run build            # Compilar
npm start                # Ejecutar

# Herramientas
npm run lint             # ESLint
npm audit                # Auditoría de seguridad
```

---

## 📊 Base de Datos (db.json)

Contiene 8 productos de ejemplo en categoría de electrónica:
- Procesadores
- Tarjetas gráficas
- Memoria RAM
- Almacenamiento SSD
- Boîtiers
- Alimentaciones
- Refroidissement
- Cartes mères

Todos los datos se guardan en **db.json** (no requiere base de datos real).

---

## 🔐 Seguridad (Fase 1)

**Actual (MVP):**
- localStorage para autenticación admin
- Validación cliente-side

**TODO (Producción):**
- JWT tokens
- HttpOnly cookies
- CSRF protection
- Rate limiting
- Input sanitization
- HTTPS

---

## 📱 Responsive Design

Totalmente responsive para:
- 📱 Móvil (< 576px)
- 📱 Tablet (576px - 992px)
- 💻 Desktop (> 992px)

---

## 🎨 Colores de la Marca

```
Primario:    #2C3E50 (Gris-azul)
Secundario:  #3498DB (Azul eléctrico)
Acento:      #E74C3C (Rojo)
Éxito:       #27AE60 (Verde)
Fondo:       #ECF0F1 (Gris claro)
```

---

## 📞 Soporte Rápido

**¿Problemas con puertos?**
```bash
# Port 3000 en uso
npm run dev -- -p 3001

# Port 3001 en uso
npm run server -- --port 3002
```

**¿SASS no compila?**
- Asegúrate que los archivos terminen en `.scss`
- Revisa los imports: `@import '@/styles/scss/variables'`

**¿Admin no funciona?**
- Verifica que estés usando exactamente: `admin` / `Admin123!`
- Abre DevTools y revisa localStorage

---

## 🚀 Resumen Rápido

| Aspecto | Estado |
|--------|--------|
| Estructura | ✅ Completa |
| Boutique | ✅ Funcional |
| Admin | ✅ Funcional |
| Estilos | ✅ SASS + Bootstrap |
| API | ✅ JSON Server |
| Stripe | ⏳ Ready (agregar keys) |
| Documentación | ✅ Completa |

---

¡Listo para desarrollar! 🎉

Cualquier duda, revisa el archivo `docs/CONCEPTION.md` para más detalles.
