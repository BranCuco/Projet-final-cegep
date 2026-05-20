// lib/api.ts
// Utilidades para comunicarse con JSON Server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category?: string;
  createdAt?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  reviews?: ProductReview[];
  shortDescription?: string;
  savings?: string;
}

export interface ProductReview {
  id: string | number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  productId: string | number;
  quantity: number;
  product?: Product;
}

// ============================================
// Funciones de Productos
// ============================================

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (response.ok) {
      return response.json();
    }

    const products = await getProducts();
    const product = products.find((item) => String(item.id) === String(id));

    if (product) {
      return product;
    }

    throw new Error('Producto no encontrado');
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        createdAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

export async function updateProduct(id: string | number, product: Partial<Product>): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(id: string | number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// ============================================
// Funciones de Búsqueda
// ============================================

export function searchProducts(products: Product[], query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// Funciones de Carrito (localStorage)
// ============================================

const CART_STORAGE_KEY = 'techgear_cart';
const CART_UPDATED_EVENT = 'techgear:cart-updated';

function normalizeProductId(productId: string | number): string {
  return String(productId);
}

function notifyCartChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

export function getCart(): CartItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = cart ? JSON.parse(cart) : [];

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .filter((item) => item && item.productId !== undefined && item.productId !== null)
      .map((item) => ({
        productId: normalizeProductId(item.productId),
        quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        product: item.product
          ? {
              ...item.product,
              id: normalizeProductId(item.product.id),
            }
          : undefined,
      }));
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      notifyCartChanged();
    }
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

export function addToCart(productId: string | number, quantity: number = 1, maxQuantity?: number): void {
  const normalizedProductId = normalizeProductId(productId);
  const cart = getCart();
  const existingItem = cart.find((item) => normalizeProductId(item.productId) === normalizedProductId);
  const allowedQuantity = typeof maxQuantity === 'number' ? Math.max(0, maxQuantity) : undefined;

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    existingItem.quantity = allowedQuantity ? Math.min(nextQuantity, allowedQuantity) : nextQuantity;
  } else {
    const initialQuantity = allowedQuantity ? Math.min(quantity, allowedQuantity) : quantity;

    if (initialQuantity > 0) {
      cart.push({ productId: normalizedProductId, quantity: initialQuantity });
    }
  }

  saveCart(cart);
}

export function removeFromCart(productId: string | number): void {
  const normalizedProductId = normalizeProductId(productId);
  const cart = getCart();
  saveCart(cart.filter((item) => normalizeProductId(item.productId) !== normalizedProductId));
}

export function updateCartQuantity(productId: string | number, quantity: number): void {
  const normalizedProductId = normalizeProductId(productId);

  if (quantity <= 0) {
    removeFromCart(normalizedProductId);
    return;
  }

  const cart = getCart();
  const existingItem = cart.find((item) => normalizeProductId(item.productId) === normalizedProductId);

  if (existingItem) {
    existingItem.quantity = quantity;
    saveCart(cart);
  }
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotal(items: CartItem[], products: Map<number, Product>): number {
  return items.reduce((total, item) => {
    const product = products.get(Number(normalizeProductId(item.productId)));
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

// ============================================
// Funciones de Autenticación Admin
// ============================================

const ADMIN_STORAGE_KEY = 'techgear_admin_token';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

export function loginAdmin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    }
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

// ============================================
// Validaciones
// ============================================

export function validateProduct(product: Partial<Product>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product.name?.trim()) {
    errors.push('El nombre es requerido');
  }

  if (!product.price || product.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }

  if (!product.description?.trim()) {
    errors.push('La descripción es requerida');
  }

  if (!product.image?.trim()) {
    errors.push('La imagen es requerida');
  }

  if (product.stock === undefined || product.stock < 0) {
    errors.push('El stock no puede ser negativo');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
