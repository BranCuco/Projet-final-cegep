// lib/api.ts
// Utilidades para comunicarse con JSON Server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category?: string;
  createdAt?: string;
}

export interface CartItem {
  productId: number;
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

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Producto no encontrado');
    return response.json();
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

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
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

export async function deleteProduct(id: number): Promise<boolean> {
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

export function getCart(): CartItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

export function addToCart(productId: number, quantity: number = 1): void {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  saveCart(cart);
}

export function removeFromCart(productId: number): void {
  const cart = getCart();
  saveCart(cart.filter((item) => item.productId !== productId));
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotal(items: CartItem[], products: Map<number, Product>): number {
  return items.reduce((total, item) => {
    const product = products.get(item.productId);
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
