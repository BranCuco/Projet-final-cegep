// lib/api.ts
// Utilidades para comunicarse con el backend ASP.NET Core

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5227/api';

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
  id?: number;
  productId: string | number;
  quantity: number;
  product?: Product;
}

type BackendProduct = {
  id: string | number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  inventoryCount: number;
};

type BackendAuthResponse = {
  token: string;
  email: string;
  roles: string[];
};

export type CurrentUserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
};

type UpdateUserProfileRequest = Omit<CurrentUserProfile, 'roles'>;

export type ShippingAddress = {
  id: number;
  label: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type UpsertShippingAddressRequest = Omit<ShippingAddress, 'id'>;

type BackendAuthRequest = {
  email: string;
  password: string;
};

type BackendProductRequest = {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  inventoryCount: number;
};

type BackendCartItemResponse = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type BackendCartRequest = {
  productId: number;
  quantity: number;
};

const AUTH_STORAGE_KEY = 'techgear_auth_token';

// ============================================
function mapBackendProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    price: product.price,
    stock: product.inventoryCount,
  };
}

function toBackendProductRequest(product: Omit<Product, 'id' | 'createdAt'> | Partial<Product>): BackendProductRequest {
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    imageUrl: product.image ?? '',
    price: Number(product.price ?? 0),
    inventoryCount: Number(product.stock ?? 0),
  };
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_STORAGE_KEY) || '';
}

function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAuthRoles(): string[] {
  const token = getAuthToken();
  if (!token) return [];

  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const directRole = payload.role;
  const schemaRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  const roles = [directRole, schemaRole]
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .map((value) => String(value));

  return Array.from(new Set(roles));
}

function hasAuthSession(): boolean {
  return Boolean(getAuthToken());
}

async function backendFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

// ============================================
// Funciones de Productos
// ============================================

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await backendFetch('/products');
    if (!response.ok) throw new Error('Error al obtener productos');
    const data = (await response.json()) as BackendProduct[];
    return data.map(mapBackendProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const response = await backendFetch(`/products/${id}`);

    if (response.ok) {
      const data = (await response.json()) as BackendProduct;
      return mapBackendProduct(data);
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
    const response = await backendFetch('/products', {
      method: 'POST',
      body: JSON.stringify(toBackendProductRequest(product)),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    const data = (await response.json()) as BackendProduct;
    return mapBackendProduct(data);
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

export async function updateProduct(id: string | number, product: Partial<Product>): Promise<Product | null> {
  try {
    const response = await backendFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendProductRequest(product)),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    const data = (await response.json()) as BackendProduct;
    return mapBackendProduct(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(id: string | number): Promise<boolean> {
  try {
    const response = await backendFetch(`/products/${id}`, {
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
// Funciones de Carrito (localStorage - temporal hasta migración completa)
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

function persistCart(cart: CartItem[], shouldNotify: boolean = true): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (shouldNotify) {
        notifyCartChanged();
      }
    }
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

function mapBackendCartItem(item: BackendCartItemResponse): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.productId,
      name: item.productName,
      description: item.productName,
      image: item.productImageUrl,
      price: Number(item.unitPrice),
      stock: item.quantity,
    },
  };
}

async function fetchBackendCart(): Promise<CartItem[]> {
  const response = await backendFetch('/cart');

  if (!response.ok) {
    throw new Error('Error al obtener el carrito del backend');
  }

  const data = (await response.json()) as BackendCartItemResponse[];
  return data.map(mapBackendCartItem);
}

async function syncCartCacheFromBackend(): Promise<CartItem[]> {
  const cart = await fetchBackendCart();
  persistCart(cart, false);
  return cart;
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

export async function loadCart(): Promise<CartItem[]> {
  if (!hasAuthToken()) {
    return getCart();
  }

  try {
    return await syncCartCacheFromBackend();
  } catch (error) {
    console.error('Error loading backend cart:', error);
    return getCart();
  }
}

export function saveCart(cart: CartItem[]): void {
  persistCart(cart, true);
}

export async function addToCart(productId: string | number, quantity: number = 1, maxQuantity?: number): Promise<void> {
  const normalizedProductId = normalizeProductId(productId);
  if (hasAuthToken()) {
    try {
      const response = await backendFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: Number(normalizedProductId),
          quantity,
        } satisfies BackendCartRequest),
      });

      if (response.ok) {
        await syncCartCacheFromBackend();
        notifyCartChanged();
        return;
      }
    } catch (error) {
      console.error('Error adding backend cart item:', error);
    }
  }

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

export async function removeFromCart(productId: string | number): Promise<void> {
  const normalizedProductId = normalizeProductId(productId);

  if (hasAuthToken()) {
    try {
      const cart = await loadCart();
      const item = cart.find((entry) => normalizeProductId(entry.productId) === normalizedProductId);

      if (item?.id) {
        const response = await backendFetch(`/cart/${item.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await syncCartCacheFromBackend();
          notifyCartChanged();
          return;
        }
      }
    } catch (error) {
      console.error('Error removing backend cart item:', error);
    }
  }

  const cart = getCart();
  saveCart(cart.filter((item) => normalizeProductId(item.productId) !== normalizedProductId));
}

export async function updateCartQuantity(productId: string | number, quantity: number): Promise<void> {
  const normalizedProductId = normalizeProductId(productId);

  if (quantity <= 0) {
    await removeFromCart(normalizedProductId);
    return;
  }

  if (hasAuthToken()) {
    try {
      const cart = await loadCart();
      const item = cart.find((entry) => normalizeProductId(entry.productId) === normalizedProductId);

      if (item?.id) {
        const response = await backendFetch(`/cart/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            productId: Number(normalizedProductId),
            quantity,
          } satisfies BackendCartRequest),
        });

        if (response.ok) {
          await syncCartCacheFromBackend();
          notifyCartChanged();
          return;
        }
      }
    } catch (error) {
      console.error('Error updating backend cart item:', error);
    }
  }

  const cart = getCart();
  const existingItem = cart.find((item) => normalizeProductId(item.productId) === normalizedProductId);

  if (existingItem) {
    existingItem.quantity = quantity;
    saveCart(cart);
  }
}

export async function clearCart(): Promise<void> {
  if (hasAuthToken()) {
    try {
      const response = await backendFetch('/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        persistCart([], false);
        notifyCartChanged();
        return;
      }
    } catch (error) {
      console.error('Error clearing backend cart:', error);
    }
  }

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

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const result = await loginAccount(username, password);
  return Boolean(result && result.roles.includes('Admin'));
}

export async function loginAccount(email: string, password: string): Promise<BackendAuthResponse | null> {
  try {
    const response = await backendFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password } satisfies BackendAuthRequest),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as BackendAuthResponse;
    setAuthToken(data.token);
    return data;
  } catch (error) {
    console.error('Error logging admin:', error);
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getAuthRoles().includes('Admin');
}

export function isAuthenticated(): boolean {
  return hasAuthSession();
}

export function logoutAdmin(): void {
  clearAuthToken();
}

export function logoutAccount(): void {
  clearAuthToken();
}

export function getAuthTokenHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  try {
    const response = await backendFetch('/users/me');
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUserProfile;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}

export async function updateCurrentUserProfile(profile: UpdateUserProfileRequest): Promise<CurrentUserProfile | null> {
  try {
    const response = await backendFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUserProfile;
  } catch (error) {
    console.error('Error updating current user profile:', error);
    return null;
  }
}

export async function getShippingAddresses(): Promise<ShippingAddress[]> {
  try {
    const response = await backendFetch('/addresses');
    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ShippingAddress[];
  } catch (error) {
    console.error('Error fetching shipping addresses:', error);
    return [];
  }
}

export async function createShippingAddress(address: UpsertShippingAddressRequest): Promise<ShippingAddress | null> {
  try {
    const response = await backendFetch('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ShippingAddress;
  } catch (error) {
    console.error('Error creating shipping address:', error);
    return null;
  }
}

export async function updateShippingAddress(id: number, address: UpsertShippingAddressRequest): Promise<ShippingAddress | null> {
  try {
    const response = await backendFetch(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ShippingAddress;
  } catch (error) {
    console.error('Error updating shipping address:', error);
    return null;
  }
}

export async function deleteShippingAddress(id: number): Promise<boolean> {
  try {
    const response = await backendFetch(`/addresses/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting shipping address:', error);
    return false;
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
