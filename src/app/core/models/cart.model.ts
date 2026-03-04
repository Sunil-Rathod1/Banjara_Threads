import { Product } from './product.model';

// ── Cart item ─────────────────────────────────────────────────────────────────
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  priceAtAdd: number;
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: string;
}

// ── Cart response ─────────────────────────────────────────────────────────────
export interface CartResponse {
  success: boolean;
  data: Cart;
}
