import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from './core/services/cart.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DecimalPipe],
  styles: [`
    .cart-overlay {
      position: fixed; inset: 0; background: rgba(26,5,5,0.52);
      backdrop-filter: blur(3px); z-index: 100;
      animation: fadeIn 0.2s ease;
    }
    .cart-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 400px;
      background: #fff; z-index: 101; display: flex; flex-direction: column;
      box-shadow: -4px 0 48px rgba(26,5,5,0.18);
      animation: slideInRight 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .qty-btn  { transition: background 0.15s; border-radius: 3px; }
    .qty-btn:hover  { background: rgba(123,28,28,0.08); }
    .close-btn { transition: background 0.15s; border-radius: 50%; }
    .close-btn:hover { background: rgba(123,28,28,0.08); }
    .remove-btn { transition: color 0.15s; }
    .remove-btn:hover { color: #7b1c1c !important; }
    .checkout-btn {
      background: linear-gradient(135deg, #7b1c1c, #5a1010);
      transition: transform 0.15s, box-shadow 0.2s;
    }
    .checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(123,28,28,0.3); }
  `],
  template: `
    <!-- Main app views are rendered here -->
    <router-outlet />

    <!-- ═══════════════════════════════════════
         Global Slide-Out Cart Drawer
         ═══════════════════════════════════════ -->
    @if (cart.isOpen()) {
      <!-- Backdrop -->
      <div class="cart-overlay" (click)="cart.close()"></div>

      <!-- Drawer panel -->
      <aside class="cart-drawer">

        <!-- ── Header ── -->
        <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:#f0e8df; flex-shrink:0;">
          <div>
            <h2 style="font-family:'Playfair Display',serif; color:#1a0505; font-size:1.15rem; font-weight:600; margin:0;">
              Your Cart
            </h2>
            <p class="text-xs mt-0.5" style="color:#a89585; font-weight:300; margin:0;">
              {{ cart.itemCount() }} item{{ cart.itemCount() !== 1 ? 's' : '' }} selected
            </p>
          </div>
          <button class="close-btn w-9 h-9 flex items-center justify-center" (click)="cart.close()" style="color:#5a4040;">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- ── Top gold hairline ── -->
        <div style="height:2px; background:linear-gradient(90deg,#7b1c1c,#c9a84c,#7b1c1c); flex-shrink:0;"></div>

        <!-- ── Items area ── -->
        <div class="flex-1 overflow-y-auto px-6 py-4">

          @if (!auth.currentUser) {
            <!-- Not signed in -->
            <div class="text-center py-16">
              <div class="text-5xl mb-4 opacity-25">🛒</div>
              <p class="text-base mb-1" style="font-family:'Playfair Display',serif; color:#5a4040;">Sign in to view your cart</p>
              <p class="text-xs mb-5" style="color:#a89585; font-weight:300;">Your saved items will appear here</p>
              <a routerLink="/auth/login" (click)="cart.close()"
                 class="inline-block px-7 py-2.5 text-sm font-semibold text-white"
                 style="background:#7b1c1c; border-radius:3px; letter-spacing:0.06em;">Sign In</a>
            </div>

          } @else if (!cart.cart()) {
            <!-- Loading -->
            <div class="flex justify-center items-center py-20">
              <svg class="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24" style="color:#c9a84c;">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>

          } @else if ((cart.cart()?.items?.length ?? 0) === 0) {
            <!-- Empty cart -->
            <div class="text-center py-16">
              <div class="text-5xl mb-4 opacity-20">🧵</div>
              <p class="text-base mb-2" style="font-family:'Playfair Display',serif; color:#5a4040;">Your cart is empty</p>
              <p class="text-xs mb-6" style="color:#a89585; font-weight:300;">Explore our hand-embroidered heritage collection</p>
              <a routerLink="/products" (click)="cart.close()"
                 class="inline-block px-7 py-2.5 text-xs font-semibold"
                 style="background:linear-gradient(135deg,#c9a84c,#b8943a); color:#2a0808; border-radius:3px; letter-spacing:0.1em; text-transform:uppercase;">
                Shop Collection
              </a>
            </div>

          } @else {
            <!-- Cart items -->
            <div class="space-y-0">
              @for (item of cart.cart()!.items; track item._id) {
                <div class="flex gap-3 py-4 border-b" style="border-color:#f5ece1;">
                  <!-- Product image -->
                  <a [routerLink]="['/products', item.product.slug]" (click)="cart.close()"
                     class="flex-shrink-0 rounded-sm overflow-hidden" style="width:72px; height:88px; background:#f5ece1;">
                    @if ((item.product.images?.length ?? 0) > 0) {
                      <img [src]="item.product.images[0].url" [alt]="item.product.name"
                           class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-2xl opacity-20">🧵</div>
                    }
                  </a>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/products', item.product.slug]" (click)="cart.close()"
                       class="block text-sm leading-snug mb-1.5 line-clamp-2"
                       style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:500;">
                      {{ item.product.name }}
                    </a>
                    <p class="text-sm font-semibold mb-2.5" style="color:#7b1c1c;">
                      ₹{{ item.product.price | number:'1.0-0' }}
                    </p>
                    <!-- Qty controls -->
                    <div class="flex items-center gap-1">
                      <button class="qty-btn w-7 h-7 flex items-center justify-center text-base leading-none"
                              style="color:#5a4040; border:1px solid #f0e8df;"
                              (click)="updateQty(item._id, item.quantity - 1)">−</button>
                      <span class="text-sm w-8 text-center font-medium" style="color:#1a0505;">
                        {{ item.quantity }}
                      </span>
                      <button class="qty-btn w-7 h-7 flex items-center justify-center text-base leading-none"
                              style="color:#5a4040; border:1px solid #f0e8df;"
                              (click)="updateQty(item._id, item.quantity + 1)">+</button>
                      <!-- Remove -->
                      <button class="remove-btn ml-auto w-7 h-7 flex items-center justify-center"
                              style="color:#d4c5b5;" (click)="removeItem(item._id)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- ── Footer (subtotal + checkout) ── -->
        @if (auth.currentUser && (cart.cart()?.items?.length ?? 0) > 0) {
          <div class="px-6 py-5 border-t" style="border-color:#f0e8df; background:#faf6f0; flex-shrink:0;">
            <!-- Subtotal row -->
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm" style="color:#8a7060; font-weight:300;">Subtotal</span>
              <span class="text-base font-semibold" style="color:#1a0505; font-family:'Playfair Display',serif;">
                ₹{{ cart.subtotal() | number:'1.0-0' }}
              </span>
            </div>
            <p class="text-xs mb-4" style="color:#a89585; font-weight:300;">Taxes & shipping calculated at checkout</p>
            <!-- Gold hairline -->
            <div class="h-px mb-4" style="background:linear-gradient(90deg,transparent,#c9a84c44,transparent);"></div>
            <!-- Checkout button -->
            <a routerLink="/cart" (click)="cart.close()"
               class="checkout-btn block w-full text-center py-3.5 text-sm font-semibold text-white"
               style="border-radius:3px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none;">
              View Cart &amp; Checkout
            </a>
            <!-- Continue shopping link -->
            <button (click)="cart.close()"
              class="block w-full text-center mt-3 text-xs" style="color:#a89585; font-weight:300;">
              ← Continue Shopping
            </button>
          </div>
        }
      </aside>
    }
  `,
})
export class App {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);

  updateQty(itemId: string, qty: number) {
    if (qty < 1) { this.removeItem(itemId); return; }
    this.cart.updateItem(itemId, qty).subscribe();
  }

  removeItem(itemId: string) {
    this.cart.removeItem(itemId).subscribe();
  }
}
