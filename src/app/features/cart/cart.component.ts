import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  styles: [`
    :host { display: block; }
    .qty-btn { transition: background 0.15s; }
    .qty-btn:hover { background: rgba(123,28,28,0.08); }
    .remove-btn { transition: color 0.15s; }
    .remove-btn:hover { color: #7b1c1c; }
    .checkout-btn { background: linear-gradient(135deg,#7b1c1c,#5a1010); letter-spacing:0.1em;
                    transition: transform 0.15s, box-shadow 0.2s; }
    .checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(123,28,28,0.3); }
  `],
  template: `
    <div class="min-h-screen" style="background:#faf6f0;">

      <!-- Page header -->
      <div class="py-10 text-center" style="background:linear-gradient(140deg,#2a0808,#7b1c1c);">
        <p class="text-xs tracking-[0.3em] uppercase mb-1" style="color:#c9a84c; letter-spacing:0.28em;">Your Selection</p>
        <h1 class="text-3xl" style="font-family:'Playfair Display',serif; color:#faf6f0; font-weight:600;">Shopping Cart</h1>
      </div>

      <div class="max-w-5xl mx-auto px-4 lg:px-8 py-10">

        @if (!auth.currentUser) {
          <!-- Not logged in -->
          <div class="text-center py-20">
            <div class="text-5xl mb-5 opacity-30">🛒</div>
            <p class="text-xl mb-3" style="font-family:'Playfair Display',serif; color:#5a4040;">
              Sign in to view your cart
            </p>
            <a routerLink="/auth/login" class="inline-block mt-2 px-8 py-3 text-sm font-semibold text-white"
               style="background:#7b1c1c; border-radius:3px; letter-spacing:0.08em;">
              Sign In
            </a>
          </div>
        } @else if (cart.cart() === null) {
          <!-- Loading -->
          <div class="text-center py-16">
            <svg class="w-8 h-8 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24" style="color:#c9a84c;">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        } @else if ((cart.cart()?.items?.length ?? 0) === 0) {
          <!-- Empty cart -->
          <div class="text-center py-20">
            <div class="text-5xl mb-5 opacity-25">🧵</div>
            <p class="text-xl mb-2" style="font-family:'Playfair Display',serif; color:#5a4040;">Your cart is empty</p>
            <p class="text-sm mb-6" style="color:#a89585; font-weight:300;">Explore our hand-embroidered collection</p>
            <a routerLink="/products" class="inline-block px-8 py-3 text-sm font-semibold"
               style="background:linear-gradient(135deg,#c9a84c,#b8943a); color:#2a0808; border-radius:3px; letter-spacing:0.1em;">
              Shop Now
            </a>
          </div>
        } @else {
          <!-- Cart items + summary -->
          <div class="flex flex-col lg:flex-row gap-8">

            <!-- Items list -->
            <div class="flex-1">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-base font-semibold" style="color:#1a0505; font-family:'Playfair Display',serif;">
                  {{ cart.itemCount() }} Item{{ cart.itemCount() !== 1 ? 's' : '' }}
                </h2>
                <button (click)="clearCart()"
                  class="text-xs" style="color:#a89585; text-decoration:underline; text-underline-offset:3px;">
                  Clear all
                </button>
              </div>

              <div class="space-y-4">
                @for (item of cart.cart()!.items; track item._id) {
                  <div class="flex gap-4 p-4" style="background:#fff; border:1px solid #f0e8df; border-radius:3px;">
                    <!-- Product image -->
                    <a [routerLink]="['/products', item.product.slug]"
                       class="flex-shrink-0 rounded-sm overflow-hidden" style="width:90px; height:110px; background:#f5ece1;">
                      @if ((item.product.images?.length ?? 0) > 0) {
                        <img [src]="item.product.images[0].url" [alt]="item.product.name"
                             class="w-full h-full object-cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center text-3xl opacity-20">🧵</div>
                      }
                    </a>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <a [routerLink]="['/products', item.product.slug]"
                         class="block font-medium leading-snug mb-1"
                         style="font-family:'Playfair Display',serif; color:#1a0505; font-size:0.95rem;">
                        {{ item.product.name }}
                      </a>
                      <p class="text-xs mb-3" style="color:#a89585; font-weight:300;">
                        ₹{{ item.priceAtAdd | number:'1.0-0' }} each
                      </p>

                      <!-- Qty controls -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center border" style="border-color:#d4c5b5; border-radius:3px; overflow:hidden;">
                          <button (click)="changeQty(item, item.quantity - 1)"
                            class="qty-btn w-8 h-8 flex items-center justify-center text-base" style="color:#7b1c1c;">−</button>
                          <span class="w-8 h-8 flex items-center justify-center text-sm" style="border-left:1px solid #d4c5b5; border-right:1px solid #d4c5b5;">
                            {{ item.quantity }}
                          </span>
                          <button (click)="changeQty(item, item.quantity + 1)"
                            class="qty-btn w-8 h-8 flex items-center justify-center text-base" style="color:#7b1c1c;">+</button>
                        </div>

                        <div class="flex items-center gap-4">
                          <span class="font-semibold text-sm" style="color:#7b1c1c;">
                            ₹{{ (item.priceAtAdd * item.quantity) | number:'1.0-0' }}
                          </span>
                          <button (click)="removeItem(item._id)"
                            class="remove-btn text-gray-300" style="color:#d4c5b5;">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Order summary -->
            <aside class="lg:w-72 flex-shrink-0">
              <div class="sticky top-24 p-6" style="background:#fff; border:1px solid #f0e8df; border-radius:3px;">
                <h2 class="text-base font-semibold mb-5" style="font-family:'Playfair Display',serif; color:#1a0505;">
                  Order Summary
                </h2>

                <div class="space-y-3 mb-5">
                  <div class="flex justify-between text-sm" style="color:#5a4040;">
                    <span style="font-weight:300;">Subtotal ({{ cart.itemCount() }} items)</span>
                    <span>₹{{ cart.subtotal() | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between text-sm" style="color:#5a4040;">
                    <span style="font-weight:300;">Shipping</span>
                    <span style="color:#22c55e;">{{ cart.subtotal() >= 999 ? 'Free' : '₹99' }}</span>
                  </div>
                  <div class="h-px" style="background:#f0e8df;"></div>
                  <div class="flex justify-between font-semibold" style="color:#1a0505; font-size:1rem;">
                    <span>Total</span>
                    <span style="color:#7b1c1c;">₹{{ total() | number:'1.0-0' }}</span>
                  </div>
                </div>

                @if (cart.subtotal() < 999) {
                  <p class="text-xs mb-4 px-3 py-2" style="background:rgba(201,168,76,0.08);color:#7b1c1c;border-radius:2px;border:1px solid rgba(201,168,76,0.2);">
                    Add ₹{{ 999 - cart.subtotal() | number:'1.0-0' }} more for free shipping
                  </p>
                }

                <button class="checkout-btn w-full py-3.5 text-sm font-semibold uppercase text-white">
                  Proceed to Checkout
                </button>

                <a routerLink="/products" class="block text-center text-xs mt-4" style="color:#a89585; text-decoration:underline; text-underline-offset:3px;">
                  ← Continue Shopping
                </a>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
})
export class CartComponent {
  readonly cart  = inject(CartService);
  readonly auth  = inject(AuthService);
  private router = inject(Router);

  total() {
    const st = this.cart.subtotal();
    return st + (st >= 999 ? 0 : 99);
  }

  changeQty(item: CartItem, qty: number) {
    if (qty <= 0) {
      this.removeItem(item._id);
    } else {
      this.cart.updateItem(item._id, qty).subscribe();
    }
  }

  removeItem(itemId: string) {
    this.cart.removeItem(itemId).subscribe();
  }

  clearCart() {
    this.cart.clear().subscribe();
  }
}
