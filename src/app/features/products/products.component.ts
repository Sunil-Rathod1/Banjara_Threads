import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  styles: [`
    :host { display: block; }

    /* ── Product card ─────────────────────────────────── */
    .product-card {
      background: #fff;
      border: 1px solid #ede4da;
      border-radius: 6px;
      overflow: hidden;
      transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 50px rgba(123,28,28,0.13);
    }
    .product-card .img-wrap { position: relative; overflow: hidden; background: #f5ece1; aspect-ratio: 3/4; }
    .product-card .img-wrap img { width:100%; height:100%; object-fit:cover; transition: transform 0.55s ease; display:block; }
    .product-card:hover .img-wrap img { transform: scale(1.08); }

    /* Quick-add overlay */
    .quick-add-bar {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 12px 12px;
      background: linear-gradient(135deg, #c9a84c, #b8943a);
      color: #2a0808;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      border: none; cursor: pointer;
      transform: translateY(100%);
      transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .product-card:hover .quick-add-bar { transform: translateY(0); }
    .quick-add-bar:hover { background: linear-gradient(135deg, #d4b55a, #c9a84c); }

    /* ── Sidebar ─────────────────────────────────────── */
    .sidebar-section { border-bottom: 1px solid #f0e4d8; padding-bottom: 20px; margin-bottom: 20px; }
    .sidebar-section:last-child { border-bottom: none; }
    .cat-pill {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; text-align: left; font-size: 0.8rem; padding: 8px 10px;
      border-radius: 5px; border: none; cursor: pointer;
      transition: background 0.18s, color 0.18s;
      font-family: 'Inter', sans-serif;
    }
    .cat-pill:hover { background: rgba(123,28,28,0.06); }

    /* ── Sort select ─────────────────────────────────── */
    .sort-select {
      width: 100%; padding: 9px 30px 9px 12px; font-size: 0.8rem;
      font-family: Inter, sans-serif; color: #1a0505;
      background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a89585' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 10px center;
      border: 1.5px solid #e4d5c5; border-radius: 5px; outline: none;
      -webkit-appearance: none; appearance: none; cursor: pointer;
      transition: border-color 0.2s;
    }
    .sort-select:focus { border-color: #c9a84c; }

    /* ── Search ──────────────────────────────────────── */
    .search-wrap { position: relative; }
    .search-input {
      width: 100%; padding: 9px 36px 9px 36px;
      font-size: 0.8rem; font-family: Inter, sans-serif; color: #1a0505;
      background: #fff; border: 1.5px solid #e4d5c5; border-radius: 5px;
      outline: none; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: #c9a84c; }
    .search-input::placeholder { color: #c4b5a5; }

    /* ── Skeleton ────────────────────────────────────── */
    .skeleton {
      background: linear-gradient(90deg, #f0e8df 25%, #f9f4ee 50%, #f0e8df 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
      border-radius: 5px;
    }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }

    /* ── Mobile filter drawer ────────────────────────── */
    .filter-drawer-overlay {
      position: fixed; inset: 0; background: rgba(26,5,5,0.45);
      backdrop-filter: blur(3px); z-index: 40;
      animation: fadeIn 0.2s ease;
    }
    .filter-drawer {
      position: fixed; left: 0; top: 0; bottom: 0; width: 80%; max-width: 300px;
      background: #fff; z-index: 41; overflow-y: auto; padding: 24px 20px;
      animation: slideLeft 0.3s cubic-bezier(0.22,1,0.36,1);
      box-shadow: 4px 0 40px rgba(26,5,5,0.18);
    }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes slideLeft { from{transform:translateX(-100%)} to{transform:translateX(0)} }

    /* ── Pagination ──────────────────────────────────── */
    .page-btn {
      width: 36px; height: 36px; border-radius: 5px; border: 1.5px solid #e4d5c5;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; cursor: pointer; transition: all 0.18s;
      background: transparent; color: #5a4040;
    }
    .page-btn:hover:not(.active) { border-color: #c9a84c; color: #7b1c1c; }
    .page-btn.active { background: #7b1c1c; border-color: #7b1c1c; color: #fff; font-weight: 600; }
    .page-btn.arrow { color: #a89585; }
    .page-btn.arrow:hover:not(:disabled) { color: #7b1c1c; border-color: #c9a84c; }
    .page-btn:disabled { opacity: 0.35; cursor: default; }

    /* ── Active filter chips ─────────────────────────── */
    .filter-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(123,28,28,0.07); color: #7b1c1c;
      border-radius: 20px; padding: 4px 10px;
      font-size: 0.72rem; font-weight: 500; letter-spacing: 0.04em;
      border: 1px solid rgba(123,28,28,0.15);
    }
    .filter-chip button { background: none; border: none; cursor: pointer; color: #7b1c1c; opacity: 0.6; padding: 0; line-height:1; font-size:0.85rem; }
    .filter-chip button:hover { opacity: 1; }
  `],
  template: `
    <div class="min-h-screen" style="background:#f8f3ed;">

      <!-- ═══════════════════════════════════════════
           Hero Banner
      ═══════════════════════════════════════════ -->
      <div class="relative overflow-hidden" style="background:linear-gradient(135deg,#1a0505 0%,#2a0808 50%,#3d0d0d 100%); min-height:200px;">
        <!-- Grid pattern -->
        <div class="absolute inset-0" style="background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(201,168,76,0.05) 39px,rgba(201,168,76,0.05) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(201,168,76,0.05) 39px,rgba(201,168,76,0.05) 40px);"></div>
        <!-- Radial glow -->
        <div class="absolute inset-0" style="background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(201,168,76,0.07) 0%,transparent 70%);"></div>
        <!-- Top hairline -->
        <div class="absolute top-0 left-0 right-0 h-px" style="background:linear-gradient(90deg,transparent 5%,#c9a84c55 30%,#c9a84c88 50%,#c9a84c55 70%,transparent 95%);"></div>
        <!-- Bottom wave -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;" preserveAspectRatio="none">
            <path d="M0 48 C360 10 1080 10 1440 48 L1440 48 L0 48Z" fill="#f8f3ed"/>
          </svg>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12 pb-16">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-xs mb-5" style="color:rgba(250,246,240,0.4);">
            <a routerLink="/" style="color:rgba(201,168,76,0.7); transition:color 0.2s;"
               onmouseover="this.style.color='#c9a84c'" onmouseout="this.style.color='rgba(201,168,76,0.7)'">Home</a>
            <span>/</span>
            <span style="color:rgba(250,246,240,0.5);">Products</span>
            @if (activeCategoryLabel()) {
              <span>/</span>
              <span style="color:rgba(250,246,240,0.7);">{{ activeCategoryLabel() }}</span>
            }
          </nav>

          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p class="text-xs tracking-[0.35em] uppercase mb-2" style="color:#c9a84c;">Heritage Collection</p>
              <h1 style="font-family:'Playfair Display',serif; color:#faf6f0; font-size:clamp(1.8rem,4vw,2.8rem); font-weight:600; line-height:1.1; margin:0;">
                @if (activeCategoryLabel()) {
                  {{ activeCategoryLabel() }}
                } @else {
                  All Products
                }
              </h1>
            </div>
            <!-- Product count pill -->
            @if (!loading()) {
              <div class="flex-shrink-0">
                <span style="background:rgba(201,168,76,0.12); border:1px solid rgba(201,168,76,0.25); color:#c9a84c; border-radius:20px; font-size:0.75rem; font-weight:500; padding:6px 14px; letter-spacing:0.06em;">
                  {{ pagination()?.total ?? 0 }} item{{ (pagination()?.total ?? 0) !== 1 ? 's' : '' }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           Main layout
      ═══════════════════════════════════════════ -->
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8">

        <!-- ── Toolbar (mobile filter toggle + sort) ── -->
        <div class="flex items-center gap-3 mb-6 lg:hidden">
          <button (click)="showMobileFilters.set(true)"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            style="background:#fff; border:1.5px solid #e4d5c5; border-radius:6px; color:#5a4040;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4h18M7 12h10M11 20h2"/>
            </svg>
            Filters
            @if (activeFilterCount() > 0) {
              <span class="w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full text-white"
                    style="background:#7b1c1c;">{{ activeFilterCount() }}</span>
            }
          </button>

          <select [(ngModel)]="sortModel" (ngModelChange)="selectSort($event)"
            class="sort-select flex-1">
            @for (opt of sortOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        <!-- Active filter chips (mobile) -->
        @if (activeFilterCount() > 0) {
          <div class="flex flex-wrap gap-2 mb-5 lg:hidden">
            @if (activeCategory()) {
              <span class="filter-chip">
                {{ activeCategoryLabel() }}
                <button (click)="selectCategory('')">✕</button>
              </span>
            }
            @if (searchQuery) {
              <span class="filter-chip">
                "{{ searchQuery }}"
                <button (click)="clearSearch()">✕</button>
              </span>
            }
          </div>
        }

        <div class="flex gap-8">

          <!-- ════════════════════════════════════════
               Desktop Sidebar
          ════════════════════════════════════════ -->
          <aside class="hidden lg:block w-60 flex-shrink-0">
            <div class="sticky top-6 rounded-xl overflow-hidden" style="background:#fff; border:1px solid #ede4da; box-shadow:0 2px 16px rgba(123,28,28,0.05);">

              <!-- Sidebar header -->
              <div class="px-5 py-4 border-b" style="border-color:#f0e4d8; background:linear-gradient(135deg,#faf6f0,#fff);">
                <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.22em; color:#c9a84c; font-weight:600; margin:0;">Filters</p>
              </div>

              <div class="px-5 py-5 space-y-6">

                <!-- Search -->
                <div>
                  <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Search</p>
                  <div class="search-wrap">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" stroke="#c4b5a5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                    </svg>
                    <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
                           class="search-input" placeholder="Search products…" />
                    @if (searchQuery) {
                      <button (click)="clearSearch()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                        style="color:#c4b5a5; line-height:1; background:none; border:none; cursor:pointer; padding:0;">✕</button>
                    }
                  </div>
                </div>

                <!-- Categories -->
                <div>
                  <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Category</p>
                  <div class="space-y-0.5">
                    <button (click)="selectCategory('')" class="cat-pill"
                      [style.background]="!activeCategory() ? 'rgba(123,28,28,0.07)' : 'transparent'"
                      [style.color]="!activeCategory() ? '#7b1c1c' : '#5a4040'"
                      [style.fontWeight]="!activeCategory() ? '600' : '400'">
                      <span>All Products</span>
                      @if (!activeCategory()) {
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#7b1c1c" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      }
                    </button>
                    @for (cat of categories(); track cat._id) {
                      <button (click)="selectCategory(cat.slug)" class="cat-pill"
                        [style.background]="activeCategory() === cat.slug ? 'rgba(123,28,28,0.07)' : 'transparent'"
                        [style.color]="activeCategory() === cat.slug ? '#7b1c1c' : '#5a4040'"
                        [style.fontWeight]="activeCategory() === cat.slug ? '600' : '400'">
                        <span>{{ cat.name }}</span>
                        @if (activeCategory() === cat.slug) {
                          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#7b1c1c" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        }
                      </button>
                    }
                  </div>
                </div>

                <!-- Sort -->
                <div>
                  <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Sort By</p>
                  <select [(ngModel)]="sortModel" (ngModelChange)="selectSort($event)" class="sort-select">
                    @for (opt of sortOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </div>

                <!-- Clear button -->
                @if (activeFilterCount() > 0) {
                  <button (click)="clearAllFilters()"
                    class="w-full text-xs font-medium py-2.5"
                    style="background:rgba(123,28,28,0.06); color:#7b1c1c; border-radius:5px; border:1px solid rgba(123,28,28,0.12); cursor:pointer; letter-spacing:0.05em; transition:background 0.18s;"
                    onmouseover="this.style.background='rgba(123,28,28,0.1)'" onmouseout="this.style.background='rgba(123,28,28,0.06)'">
                    Clear All Filters
                  </button>
                }
              </div>
            </div>
          </aside>

          <!-- ════════════════════════════════════════
               Product Grid Area
          ════════════════════════════════════════ -->
          <main class="flex-1 min-w-0">

            <!-- Desktop toolbar -->
            <div class="hidden lg:flex items-center justify-between mb-6">
              <!-- Active filter chips -->
              <div class="flex flex-wrap items-center gap-2">
                @if (activeCategory()) {
                  <span class="filter-chip">
                    {{ activeCategoryLabel() }}
                    <button (click)="selectCategory('')">✕</button>
                  </span>
                }
                @if (searchQuery) {
                  <span class="filter-chip">
                    "{{ searchQuery }}"
                    <button (click)="clearSearch()">✕</button>
                  </span>
                }
                @if (!loading()) {
                  <span class="text-sm" style="color:#a89585; font-weight:300;">
                    @if (activeFilterCount() === 0) {
                      Showing all {{ pagination()?.total ?? 0 }} products
                    }
                  </span>
                }
              </div>
              <!-- Item count when chips shown -->
              @if (!loading() && activeFilterCount() > 0) {
                <span class="text-xs flex-shrink-0" style="color:#a89585; font-weight:300;">
                  {{ pagination()?.total ?? 0 }} result{{ (pagination()?.total ?? 0) !== 1 ? 's' : '' }}
                </span>
              }
            </div>

            <!-- ── Error ── -->
            @if (error()) {
              <div class="text-center py-20 rounded-xl" style="background:#fff; border:1px solid #ede4da;">
                <div class="text-4xl mb-4 opacity-30">⚠️</div>
                <p class="text-sm mb-4" style="color:#8a7060;">{{ error() }}</p>
                <button (click)="loadProducts()"
                  class="text-xs font-semibold px-6 py-2.5 text-white"
                  style="background:#7b1c1c; border-radius:5px; border:none; cursor:pointer; letter-spacing:0.08em;">Try Again</button>
              </div>
            }

            <!-- ── Loading skeleton ── -->
            @if (loading()) {
              <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                @for (n of [1,2,3,4,5,6,7,8,9,10,11,12]; track n) {
                  <div class="rounded-xl overflow-hidden" style="background:#fff; border:1px solid #ede4da;">
                    <div class="skeleton" style="aspect-ratio:3/4;"></div>
                    <div class="p-3 space-y-2">
                      <div class="skeleton h-2.5 w-2/3"></div>
                      <div class="skeleton h-3.5 w-full"></div>
                      <div class="skeleton h-3.5 w-4/5"></div>
                      <div class="skeleton h-4 w-1/3 mt-1"></div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- ── Empty state ── -->
            @if (!loading() && !error() && products().length === 0) {
              <div class="text-center py-28 rounded-xl" style="background:#fff; border:1px solid #ede4da;">
                <div class="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center text-3xl"
                     style="background:linear-gradient(135deg,#fce4e4,#fbf0ce);">🧵</div>
                <p class="text-xl mb-2" style="font-family:'Playfair Display',serif; color:#3d0d0d; font-weight:600;">No products found</p>
                <p class="text-sm mb-6" style="color:#a89585; font-weight:300;">Try adjusting your search or filters</p>
                <button (click)="clearAllFilters()"
                  class="inline-block px-8 py-3 text-sm font-semibold text-white"
                  style="background:#7b1c1c; border-radius:6px; border:none; cursor:pointer; letter-spacing:0.06em;">
                  Clear Filters
                </button>
              </div>
            }

            <!-- ── Product grid ── -->
            @if (!loading() && products().length > 0) {
              <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 mb-10">
                @for (product of products(); track product._id) {
                  <article class="product-card group">

                    <!-- Image area -->
                    <div class="img-wrap">
                      @if (product.images.length > 0) {
                        <img [src]="product.images[0].url" [alt]="product.images[0].alt || product.name" loading="lazy" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center text-5xl opacity-15" style="aspect-ratio:3/4;">🧵</div>
                      }

                      <!-- Badges -->
                      <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        @if (product.isFeatured) {
                          <span style="background:linear-gradient(135deg,#c9a84c,#b8943a); color:#2a0808; font-size:0.6rem; font-weight:700; padding:3px 7px; border-radius:3px; letter-spacing:0.1em; text-transform:uppercase;">New</span>
                        }
                        @if (product.comparePrice && product.comparePrice > product.price) {
                          <span style="background:#7b1c1c; color:#fff; font-size:0.6rem; font-weight:700; padding:3px 7px; border-radius:3px; letter-spacing:0.08em;">-{{ discountPct(product) }}%</span>
                        }
                      </div>

                      <!-- Out of stock overlay -->
                      @if (!product.inStock) {
                        <div class="absolute inset-0 flex items-center justify-center" style="background:rgba(26,5,5,0.45);">
                          <span style="background:rgba(26,5,5,0.75); color:#faf6f0; font-size:0.7rem; font-weight:600; padding:6px 14px; border-radius:4px; letter-spacing:0.1em; text-transform:uppercase;">Out of Stock</span>
                        </div>
                      }

                      <!-- Quick add button (hover reveal) -->
                      @if (product.inStock) {
                        <button class="quick-add-bar" (click)="quickAdd($event, product)">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          Add to Cart
                        </button>
                      }

                      <!-- View detail link overlay top-right -->
                      <a [routerLink]="['/products', product.slug]"
                         class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                         style="background:rgba(255,255,255,0.92); box-shadow:0 2px 8px rgba(0,0,0,0.12);"
                         title="View product">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="#2a0808" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                    </div>

                    <!-- Info area -->
                    <div class="p-3 pt-3.5">
                      <a [routerLink]="['/products', product.slug]" style="text-decoration:none;">
                        <p class="truncate mb-1" style="font-size:0.68rem; color:#b8a898; font-weight:300; letter-spacing:0.04em;">
                          {{ categoryName(product) }}
                        </p>
                        <h3 class="line-clamp-2 leading-snug mb-2.5"
                            style="font-family:'Playfair Display',serif; color:#1a0505; font-size:0.875rem; font-weight:500; min-height:2.6em;">
                          {{ product.name }}
                        </h3>
                      </a>

                      <!-- Price row -->
                      <div class="flex items-center gap-2 mb-1.5">
                        <span style="color:#7b1c1c; font-size:1rem; font-weight:700; font-family:'Playfair Display',serif;">
                          ₹{{ product.price | number:'1.0-0' }}
                        </span>
                        @if (product.comparePrice && product.comparePrice > product.price) {
                          <span style="font-size:0.75rem; color:#c4b5a5; text-decoration:line-through; font-weight:300;">
                            ₹{{ product.comparePrice | number:'1.0-0' }}
                          </span>
                        }
                      </div>

                      <!-- Stars -->
                      @if (product.ratings.count > 0) {
                        <div class="flex items-center gap-1.5">
                          <div class="flex gap-0.5">
                            @for (s of stars(product.ratings.average); track $index) {
                              <svg width="11" height="11" viewBox="0 0 24 24"
                                   [attr.fill]="s !== 'empty' ? '#c9a84c' : 'none'"
                                   stroke="#c9a84c" stroke-width="1.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            }
                          </div>
                          <span style="font-size:0.65rem; color:#b8a898;">({{ product.ratings.count }})</span>
                        </div>
                      }
                    </div>
                  </article>
                }
              </div>

              <!-- ── Pagination ── -->
              @if ((pagination()?.pages ?? 1) > 1) {
                <div class="flex items-center justify-center gap-2 pt-4 pb-8">
                  <button class="page-btn arrow" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  @for (p of pageRange(); track p) {
                    @if (p === -1) {
                      <span style="color:#c4b5a5; font-size:0.8rem; padding:0 2px;">…</span>
                    } @else {
                      <button class="page-btn" [class.active]="currentPage() === p" (click)="goToPage(p)">{{ p }}</button>
                    }
                  }
                  <button class="page-btn arrow" [disabled]="currentPage() === (pagination()?.pages ?? 1)" (click)="goToPage(currentPage() + 1)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              }
            }
          </main>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           Mobile filter drawer
      ═══════════════════════════════════════════ -->
      @if (showMobileFilters()) {
        <div class="filter-drawer-overlay" (click)="showMobileFilters.set(false)"></div>
        <div class="filter-drawer">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.22em; color:#c9a84c; font-weight:600; margin:0;">Filters</p>
            <button (click)="showMobileFilters.set(false)"
              style="background:rgba(123,28,28,0.06); border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5a4040; font-size:1.1rem;">✕</button>
          </div>

          <!-- Search -->
          <div class="mb-5">
            <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Search</p>
            <div class="search-wrap">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" stroke="#c4b5a5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
                     class="search-input" placeholder="Search products…" />
            </div>
          </div>

          <!-- Categories -->
          <div class="mb-5">
            <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Category</p>
            <div class="space-y-0.5">
              <button (click)="selectCategory(''); showMobileFilters.set(false)" class="cat-pill"
                [style.background]="!activeCategory() ? 'rgba(123,28,28,0.07)' : 'transparent'"
                [style.color]="!activeCategory() ? '#7b1c1c' : '#5a4040'"
                [style.fontWeight]="!activeCategory() ? '600' : '400'">
                All Products
              </button>
              @for (cat of categories(); track cat._id) {
                <button (click)="selectCategory(cat.slug); showMobileFilters.set(false)" class="cat-pill"
                  [style.background]="activeCategory() === cat.slug ? 'rgba(123,28,28,0.07)' : 'transparent'"
                  [style.color]="activeCategory() === cat.slug ? '#7b1c1c' : '#5a4040'"
                  [style.fontWeight]="activeCategory() === cat.slug ? '600' : '400'">
                  {{ cat.name }}
                </button>
              }
            </div>
          </div>

          <!-- Sort -->
          <div class="mb-6">
            <p style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.18em; color:#a89585; font-weight:600; margin:0 0 10px;">Sort By</p>
            <select [(ngModel)]="sortModel" (ngModelChange)="selectSort($event); showMobileFilters.set(false)" class="sort-select">
              @for (opt of sortOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          @if (activeFilterCount() > 0) {
            <button (click)="clearAllFilters(); showMobileFilters.set(false)"
              class="w-full text-xs font-medium py-3"
              style="background:rgba(123,28,28,0.06); color:#7b1c1c; border-radius:6px; border:1px solid rgba(123,28,28,0.12); cursor:pointer; letter-spacing:0.06em;">
              Clear All Filters
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc    = inject(CartService);
  readonly auth      = inject(AuthService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);

  products    = signal<Product[]>([]);
  categories  = signal<Category[]>([]);
  loading     = signal(true);
  error       = signal('');
  pagination  = signal<any>(null);
  activeCategory = signal('');
  activeSort     = signal('-createdAt');
  currentPage    = signal(1);
  showMobileFilters = signal(false);
  searchQuery    = '';
  sortModel      = '-createdAt';
  private searchTimer: any;

  sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price',      label: 'Price: Low to High' },
    { value: '-price',     label: 'Price: High to Low' },
    { value: '-ratings.average', label: 'Highest Rated' },
  ];

  activeCategoryLabel = computed<string>(() => {
    const slug = this.activeCategory();
    if (!slug) return '';
    const cat = this.categories().find(c => c.slug === slug);
    return cat?.name ?? slug;
  });

  activeFilterCount = computed<number>(() => {
    let count = 0;
    if (this.activeCategory()) count++;
    if (this.searchQuery) count++;
    return count;
  });

  ngOnInit() {
    this.productSvc.getCategories().subscribe({ next: (res) => this.categories.set(res.data) });

    // Read query params on init
    const params = this.route.snapshot.queryParams;
    if (params['category']) this.activeCategory.set(params['category']);
    if (params['sort'])     { this.activeSort.set(params['sort']); this.sortModel = params['sort']; }
    if (params['page'])     this.currentPage.set(Number(params['page']));

    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set('');
    this.productSvc.getProducts({
      category: this.activeCategory() || undefined,
      sort:     this.activeSort(),
      page:     this.currentPage(),
      limit:    16,
      search:   this.searchQuery || undefined,
    }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
      },
    });
  }

  selectCategory(slug: string) {
    this.activeCategory.set(slug);
    this.currentPage.set(1);
    this.updateUrl();
    this.loadProducts();
  }

  selectSort(val: string) {
    this.activeSort.set(val);
    this.sortModel = val;
    this.currentPage.set(1);
    this.updateUrl();
    this.loadProducts();
  }

  onSearch(val: string) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProducts();
    }, 420);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.activeCategory.set('');
    this.activeSort.set('-createdAt');
    this.sortModel = '-createdAt';
    this.currentPage.set(1);
    this.updateUrl();
    this.loadProducts();
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    this.updateUrl();
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  quickAdd(e: Event, product: Product) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.currentUser) { this.router.navigate(['/auth/login']); return; }
    this.cartSvc.addItem(product._id, 1).subscribe({
      next: () => this.cartSvc.open(),
    });
  }

  private updateUrl() {
    this.router.navigate([], {
      queryParams: {
        category: this.activeCategory() || null,
        sort: this.activeSort() !== '-createdAt' ? this.activeSort() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  discountPct(p: Product): number {
    if (!p.comparePrice) return 0;
    return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
  }

  categoryName(p: Product): string {
    if (typeof p.category === 'object') return (p.category as Category).name;
    return '';
  }

  stars(avg: number): ('full' | 'half' | 'empty')[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (avg >= i + 1) return 'full';
      if (avg >= i + 0.5) return 'half';
      return 'empty';
    });
  }

  pageRange(): number[] {
    const total = this.pagination()?.pages ?? 1;
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1); // ellipsis
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1); // ellipsis
    pages.push(total);
    return pages;
  }
}
