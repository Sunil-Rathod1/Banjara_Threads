import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  styles: [`
    :host { display: block; }

    .navbar-glass {
      background: rgba(250, 246, 240, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(201,168,76,0.15);
    }

    .hero-bg {
      background: radial-gradient(ellipse at 40% 30%, #5a1010 0%, #2a0808 45%, #150404 100%);
    }
    .hero-grid {
      background-image:
        repeating-linear-gradient(0deg,   transparent, transparent 59px, rgba(201,168,76,0.05) 59px, rgba(201,168,76,0.05) 60px),
        repeating-linear-gradient(90deg,  transparent, transparent 59px, rgba(201,168,76,0.05) 59px, rgba(201,168,76,0.05) 60px);
    }
    .hero-glow {
      background: radial-gradient(ellipse 70% 55% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%);
    }

    .gold-btn-hero {
      background: linear-gradient(135deg, #c9a84c, #b8943a, #c9a84c);
      background-size: 200% 100%;
      transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
      letter-spacing:0.12em;
    }
    .gold-btn-hero:hover {
      background-position: right center;
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(201,168,76,0.45);
    }
    .outline-btn-hero {
      border: 1.5px solid rgba(201,168,76,0.55);
      color: #c9a84c;
      letter-spacing: 0.12em;
      transition: border-color 0.2s, background 0.2s, transform 0.2s;
    }
    .outline-btn-hero:hover {
      border-color: #c9a84c;
      background: rgba(201,168,76,0.08);
      transform: translateY(-2px);
    }

    .cat-card { position:relative; overflow:hidden; transition:transform 0.3s, box-shadow 0.25s; display:block; }
    .cat-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(26,5,5,0.12); }
    .cat-card img { transition: transform 0.5s ease; }
    .cat-card:hover img { transform: scale(1.08); }
    .featured-overlay-btn { opacity:0; transform:translateY(6px); transition:opacity 0.25s,transform 0.25s; }
    .product-card:hover .featured-overlay-btn { opacity:1; transform:translateY(0); }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    .nav-cart-btn { background:transparent; border:none; cursor:pointer; transition:color 0.15s; }
    .feat-card {
      background: #fff;
      border: 1px solid #f0e8df;
      transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
    }
    .feat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(123,28,28,0.1);
      border-color: rgba(201,168,76,0.35);
    }

    .nav-sign-in {
      letter-spacing:0.06em;
      transition: color 0.2s;
    }
    .nav-sign-in:hover { color: #c9a84c; }
    .nav-get-started {
      background: linear-gradient(135deg, #7b1c1c, #5a1010);
      letter-spacing: 0.06em;
      transition: transform 0.15s, box-shadow 0.2s;
    }
    .nav-get-started:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(123,28,28,0.3);
    }
  `],
  template: `
    <div class="min-h-screen" style="background-color:#faf6f0;">

      <!-- ── Sticky glassmorphism navbar ───────────────────────────────────── -->
      <header class="sticky top-0 z-50 navbar-glass">
        <div class="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

          <!-- Wordmark + Logo -->
          <a routerLink="/" class="flex items-center gap-3">
            <img src="logo.png" alt="Rathod Banjara Threads"
                 class="h-11 w-11 flex-shrink-0"
                 style="mix-blend-mode: multiply; object-fit: cover; border-radius: 50%;" />
            <div class="hidden sm:block">
              <p class="text-xs font-semibold leading-none" style="color:#7b1c1c; font-family:'Playfair Display',serif; letter-spacing:0.05em;">
                Rathod Banjara Threads
              </p>
              <p class="text-[9px] tracking-[0.3em] uppercase mt-0.5" style="color:#c9a84c; letter-spacing:0.25em;">
                Wear the Heritage
              </p>
            </div>
          </a>

          <!-- Nav actions -->
          <div class="flex items-center gap-3">
            <!-- Products link (always visible) -->
            <a routerLink="/products"
               class="text-xs font-medium px-3 py-2 hidden sm:block"
               style="color:#5a4040; letter-spacing:0.04em; transition:color 0.2s;"
               onmouseover="this.style.color='#7b1c1c'" onmouseout="this.style.color='#5a4040'">
              Shop
            </a>

            @if (auth.currentUser) {
              <!-- Cart icon with badge (opens drawer) -->
              <button class="nav-cart-btn relative p-2" style="color:#5a4040;"
                      (click)="cartSvc.toggle()" aria-label="Open cart">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                @if (cartSvc.itemCount() > 0) {
                  <span class="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold flex items-center justify-center"
                        style="background:#7b1c1c; border-radius:50%;">
                    {{ cartSvc.itemCount() > 9 ? '9+' : cartSvc.itemCount() }}
                  </span>
                }
              </button>

              <!-- Account link -->
              <a routerLink="/account"
                 class="text-xs font-medium px-3 py-2 hidden sm:block"
                 style="color:#5a4040; transition:color 0.2s;"
                 onmouseover="this.style.color='#7b1c1c'" onmouseout="this.style.color='#5a4040'">
                Hi, {{ auth.currentUser.name.split(' ')[0] }}
              </a>
              @if (auth.isAdmin) {
                <a routerLink="/admin"
                   class="text-xs font-semibold px-3 py-2 hidden sm:block"
                   style="color:#c9a84c; border:1px solid rgba(201,168,76,0.35); border-radius:3px; letter-spacing:0.04em;">
                  Admin
                </a>
              }
              <button (click)="auth.logout()"
                class="nav-sign-in text-xs font-medium px-4 py-2"
                style="color:#7b1c1c; border:1px solid rgba(123,28,28,0.3); border-radius:3px;">
                Sign Out
              </button>
            } @else {
              <a routerLink="/auth/login"
                 class="nav-sign-in text-xs font-medium px-4 py-2 hidden sm:block"
                 style="color:#7b1c1c;">
                Sign In
              </a>
              <a routerLink="/auth/register"
                 class="nav-get-started text-xs font-semibold px-5 py-2.5 text-white"
                 style="border-radius:3px;">
                Get Started
              </a>
            }
          </div>
        </div>
      </header>

      <!-- ── Hero ──────────────────────────────────────────────────────────── -->
      <section class="relative overflow-hidden hero-bg" style="min-height: 92vh;">

        <!-- Grid overlay -->
        <div class="absolute inset-0 hero-grid"></div>
        <!-- Glow -->
        <div class="absolute inset-0 hero-glow"></div>
        <!-- Top gold hairline -->
        <div class="absolute top-0 left-0 right-0 h-px"
             style="background: linear-gradient(90deg, transparent 5%, #c9a84c44 30%, #c9a84c88 50%, #c9a84c44 70%, transparent 95%);"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28 flex flex-col items-center text-center">

          <!-- Logo in frosted glass circle -->
          <div class="relative mb-10">
            <!-- Rotating ring -->
            <div class="absolute inset-[-18px] rounded-full"
                 style="border: 1px dashed rgba(201,168,76,0.25); animation: spin 40s linear infinite;"></div>
            <div class="absolute inset-[-36px] rounded-full"
                 style="border: 1px dashed rgba(201,168,76,0.1); animation: spin 60s linear infinite reverse;"></div>

            <div class="rounded-full p-6 relative"
                 style="background: rgba(250,246,240,0.06); backdrop-filter: blur(8px);
                        border: 1px solid rgba(201,168,76,0.2);
                        box-shadow: 0 0 60px rgba(201,168,76,0.12), inset 0 0 40px rgba(201,168,76,0.04);">
              <!-- wrapper applies the glow shadow; img uses multiply to erase white bg -->
              <div style="filter: drop-shadow(0 4px 32px rgba(201,168,76,0.35)) drop-shadow(0 0 12px rgba(201,168,76,0.2));">
                <img src="logo.png" alt="Rathod Banjara Threads"
                     class="h-36 w-36 relative z-10"
                     style="mix-blend-mode: multiply; display: block; border-radius: 50%; object-fit: cover;" />
              </div>
            </div>
          </div>

          <!-- Eyebrow -->
          <div class="flex items-center gap-4 mb-5">
            <div class="h-px w-12" style="background: linear-gradient(90deg, transparent, #c9a84c55);"></div>
            <p class="text-xs tracking-[0.4em] uppercase" style="color:#c9a84c; letter-spacing:0.35em;">
              Heritage Couture
            </p>
            <div class="h-px w-12" style="background: linear-gradient(90deg, #c9a84c55, transparent);"></div>
          </div>

          <!-- Main heading -->
          <h1 class="leading-tight mb-4"
              style="font-family:'Playfair Display',serif; color:#faf6f0; font-size:clamp(2.6rem,7vw,5.5rem); font-weight:600; line-height:1.05;">
            Wear the<br>
            <em style="color:#c9a84c; font-style:italic;">Heritage</em>
          </h1>

          <!-- Subheading -->
          <p class="max-w-xl mx-auto mb-10 leading-relaxed"
             style="color:rgba(250,246,240,0.58); font-size:1.05rem; font-weight:300; letter-spacing:0.03em;">
            Exquisite hand-embroidered Banjara textile art —<br class="hidden sm:block"/>
            each thread a story, each stitch a tradition.
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4">
            <a routerLink="/products"
               class="gold-btn-hero inline-block px-9 py-4 text-sm font-semibold"
               style="color:#2a0808; border-radius:3px;">
              Explore Collection
            </a>
            <a routerLink="/auth/register"
               class="outline-btn-hero inline-block px-9 py-4 text-sm font-semibold"
               style="border-radius:3px;">
              Join the Heritage
            </a>
          </div>

          <!-- Scroll indicator -->
          <div class="mt-14 flex flex-col items-center gap-2 opacity-40">
            <span class="text-xs tracking-[0.2em] uppercase" style="color:#c9a84c;">Explore</span>
            <div style="width:1px; height:32px; background: linear-gradient(180deg, #c9a84c, transparent);"></div>
          </div>
        </div>

        <!-- Bottom wave -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"
               class="w-full h-auto" style="display:block;" preserveAspectRatio="none">
            <path d="M0 80 C360 20 1080 20 1440 80 L1440 80 L0 80Z" fill="#faf6f0"/>
          </svg>
        </div>
      </section>

      <!-- ── Divider strip ───────────────────────────────────────────────────── -->
      <div class="flex items-center justify-center gap-6 py-10 px-6">
        <div class="h-px flex-1 max-w-xs" style="background: linear-gradient(90deg, transparent, #c9a84c44);"></div>
        <div class="flex gap-2 items-center">
          @for (d of [1,2,3]; track d) {
            <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a84c" [style.opacity]="d === 2 ? '1' : '0.4'">
              <path d="M4 0L8 4L4 8L0 4Z"/>
            </svg>
          }
        </div>
        <div class="h-px flex-1 max-w-xs" style="background: linear-gradient(90deg, #c9a84c44, transparent);"></div>
      </div>

      <!-- ── Categories Showcase ───────────────────────────────────────────── -->
      @if (allCategories().length > 0) {
        <section class="max-w-6xl mx-auto px-6 pb-16">
          <div class="text-center mb-10">
            <p class="text-xs tracking-[0.3em] uppercase mb-3" style="color:#c9a84c; letter-spacing:0.28em;">
              Our Collections
            </p>
            <h2 class="text-3xl" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">
              Shop by Category
            </h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            @for (cat of allCategories(); track cat._id) {
              <a [routerLink]="['/products']" [queryParams]="{category: cat.slug}"
                 class="cat-card block rounded-sm" style="aspect-ratio:1; background:#f5ece1;">
                @if (cat.image?.url) {
                  <img [src]="cat.image.url" [alt]="cat.image.alt || cat.name"
                       class="w-full h-full object-cover" style="display:block;" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-4xl opacity-20">🏺</div>
                }
                <div class="absolute inset-0" style="background:linear-gradient(180deg,transparent 45%,rgba(42,8,8,0.78) 100%);"></div>
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <p style="color:#faf6f0; font-family:'Playfair Display',serif; font-size:0.875rem; font-weight:600; margin:0;">
                    {{ cat.name }}
                  </p>
                </div>
              </a>
            }
          </div>
        </section>
      }

      <!-- ── Featured Products ─────────────────────────────────────────────── -->
      <section class="py-14" style="background:#fff;">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-11">
            <p class="text-xs tracking-[0.3em] uppercase mb-3" style="color:#c9a84c; letter-spacing:0.28em;">
              Handpicked for You
            </p>
            <h2 class="text-3xl" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">
              Featured Collection
            </h2>
          </div>
          @if (loadingFeatured()) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
              @for (n of [1,2,3,4,5,6,7,8]; track n) {
                <div>
                  <div style="aspect-ratio:3/4; background:linear-gradient(90deg,#f0e8df,#faf6f0,#f0e8df); background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite; border-radius:3px; margin-bottom:10px;"></div>
                  <div style="height:12px; background:#f0e8df; border-radius:3px; width:75%; margin-bottom:8px;"></div>
                  <div style="height:12px; background:#f0e8df; border-radius:3px; width:50%;"></div>
                </div>
              }
            </div>
          } @else if (featuredProducts().length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              @for (product of featuredProducts(); track product._id) {
                <article class="product-card group" style="background:#fff; border:1px solid #f0e8df; border-radius:3px; overflow:hidden; transition:box-shadow 0.25s,transform 0.25s;">
                  <a [routerLink]="['/products', product.slug]" class="block relative"
                     style="aspect-ratio:3/4; overflow:hidden; background:#f5ece1;">
                    @if (product.images.length > 0) {
                      <img [src]="product.images[0].url" [alt]="product.images[0].alt || product.name"
                           class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-4xl opacity-20">🧵</div>
                    }
                    @if (product.inStock) {
                      <button (click)="quickAddFeatured($event, product)"
                        class="featured-overlay-btn absolute bottom-3 left-3 right-3 py-2 text-xs font-semibold tracking-[0.1em] uppercase"
                        style="background:rgba(201,168,76,0.95); color:#2a0808; border-radius:2px; border:none; cursor:pointer;">
                        Add to Cart
                      </button>
                    }
                  </a>
                  <div class="p-3">
                    <p class="text-xs mb-0.5 truncate" style="color:#a89585; font-weight:300;">
                      {{ getCatName(product) }}
                    </p>
                    <a [routerLink]="['/products', product.slug]">
                      <h3 class="text-sm font-medium mb-1.5 line-clamp-2 leading-snug"
                          style="color:#1a0505; font-family:'Playfair Display',serif;">
                        {{ product.name }}
                      </h3>
                    </a>
                    <span class="font-semibold" style="color:#7b1c1c; font-size:0.95rem;">
                      ₹{{ product.price | number:'1.0-0' }}
                    </span>
                  </div>
                </article>
              }
            </div>
            <div class="text-center">
              <a routerLink="/products"
                 class="inline-block px-10 py-3.5 text-sm font-semibold"
                 style="border:1.5px solid rgba(123,28,28,0.28); color:#7b1c1c; border-radius:3px; letter-spacing:0.08em; transition:all 0.2s;"
                 onmouseover="this.style.background='rgba(123,28,28,0.04)'" onmouseout="this.style.background='transparent'">
                View Full Collection →
              </a>
            </div>
          }
        </div>
      </section>

      <!-- ── Feature cards ───────────────────────────────────────────────────── -->
      <section class="max-w-6xl mx-auto px-6 pb-24">
        <div class="text-center mb-12">
          <p class="text-xs tracking-[0.3em] uppercase mb-3" style="color:#c9a84c; letter-spacing:0.28em;">
            Why Banjara Threads
          </p>
          <h2 class="text-3xl" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">
            Crafted with Purpose
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          @for (feat of features; track feat.title) {
            <div class="feat-card rounded-sm p-8">
              <!-- Icon -->
              <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-6"
                   style="background: linear-gradient(135deg, #fce4e4, #fbf0ce);
                          box-shadow: 0 4px 16px rgba(123,28,28,0.08);">
                {{ feat.icon }}
              </div>
              <!-- Gold line accent -->
              <div class="w-8 h-0.5 mb-4" style="background: linear-gradient(90deg, #c9a84c, transparent);"></div>
              <h3 class="text-lg font-semibold mb-3"
                  style="color:#7b1c1c; font-family:'Playfair Display',serif;">
                {{ feat.title }}
              </h3>
              <p class="text-sm leading-relaxed" style="color:#8a7060; font-weight:300;">
                {{ feat.desc }}
              </p>
            </div>
          }
        </div>
      </section>

      <!-- ── Brand footer strip ─────────────────────────────────────────────── -->
      <footer class="py-10 text-center" style="background:#1a0505;">
        <img src="logo.png" alt="" class="h-10 w-10 mx-auto mb-3 opacity-60" style="border-radius: 50%; object-fit: cover;" />
        <p class="text-xs tracking-[0.4em] uppercase" style="color:rgba(201,168,76,0.4); letter-spacing:0.35em;">
          Rathod · Banjara · Threads &nbsp;·&nbsp; Wear the Heritage
        </p>
      </footer>

    </div>
  `,
})
export class HomeComponent implements OnInit {
  readonly auth    = inject(AuthService);
  readonly cartSvc = inject(CartService);
  private  prodSvc = inject(ProductService);
  private  router  = inject(Router);

  featuredProducts = signal<Product[]>([]);
  allCategories    = signal<Category[]>([]);
  loadingFeatured  = signal(true);

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.cartSvc.load().subscribe();
    }
    this.prodSvc.getFeatured(8).subscribe({
      next: (res) => { this.featuredProducts.set(res.data); this.loadingFeatured.set(false); },
      error: () => this.loadingFeatured.set(false),
    });
    this.prodSvc.getCategories().subscribe({
      next: (res) => this.allCategories.set(res.data),
    });
  }

  quickAddFeatured(e: Event, product: Product) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.currentUser) { this.router.navigate(['/auth/login']); return; }
    this.cartSvc.addItem(product._id, 1).subscribe({
      next: () => this.cartSvc.open(),
    });
  }

  getCatName(p: Product): string {
    if (typeof p.category === 'object' && p.category) return (p.category as Category).name;
    return '';
  }

  features = [
    {
      icon: '🧵',
      title: 'Hand-Embroidered',
      desc: 'Every piece is handcrafted by master Banjara artisans using traditional thread work passed through generations.',
    },
    {
      icon: '🏺',
      title: 'Tribal Heritage',
      desc: 'Our designs are rooted in centuries of Banjara tribal culture, identity, and artistic expression.',
    },
    {
      icon: '✦',
      title: 'Premium Curation',
      desc: 'Carefully sourced materials and rigorous quality standards ensure lasting beauty in every garment.',
    },
  ];
}
