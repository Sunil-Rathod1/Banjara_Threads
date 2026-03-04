import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Cart, CartResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cart`;

  // ── State ────────────────────────────────────────────────────────────────
  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() => this.cart()?.itemCount ?? 0);
  readonly subtotal  = computed(() => this.cart()?.subtotal  ?? 0);
  readonly isOpen    = signal(false);

  // ── API calls ─────────────────────────────────────────────────────────────
  load() {
    return this.http.get<CartResponse>(this.base).pipe(
      tap((res) => this.cart.set(res.data)),
      catchError(() => of(null))
    );
  }

  addItem(productId: string, quantity = 1) {
    return this.http
      .post<CartResponse>(`${this.base}/items`, { productId, quantity })
      .pipe(tap((res) => this.cart.set(res.data)));
  }

  updateItem(itemId: string, quantity: number) {
    return this.http
      .put<CartResponse>(`${this.base}/items/${itemId}`, { quantity })
      .pipe(tap((res) => this.cart.set(res.data)));
  }

  removeItem(itemId: string) {
    return this.http
      .delete<CartResponse>(`${this.base}/items/${itemId}`)
      .pipe(tap((res) => this.cart.set(res.data)));
  }

  clear() {
    return this.http
      .delete<CartResponse>(this.base)
      .pipe(tap((res) => this.cart.set(res.data)));
  }

  // ── Drawer helpers ────────────────────────────────────────────────────────
  open()  { this.isOpen.set(true);  }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update((v) => !v); }

  // ── Reset on logout ───────────────────────────────────────────────────────
  reset() { this.cart.set(null); this.isOpen.set(false); }
}
