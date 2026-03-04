import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .stat-card { background:#fff; border:1px solid #f0e8df; border-radius:8px;
                 transition:box-shadow 0.25s,transform 0.2s; }
    .stat-card:hover { box-shadow:0 8px 32px rgba(123,28,28,0.1); transform:translateY(-2px); }
    .action-card { background:#fff; border:1px solid #f0e8df; border-radius:8px;
                   transition:box-shadow 0.2s,transform 0.2s; text-decoration:none; display:flex; align-items:center; gap:16px; padding:20px; }
    .action-card:hover { box-shadow:0 6px 24px rgba(123,28,28,0.09); transform:translateY(-2px); }
    .icon-circle { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  `],
  template: `
    <div>
      <!-- Page title -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h2 style="font-family:'Playfair Display',serif; color:#1a0505; font-size:1.4rem; font-weight:600; margin:0 0 4px;">
            Dashboard
          </h2>
          <p style="color:#a89585; font-size:0.875rem; font-weight:300; margin:0;">
            Store overview at a glance
          </p>
        </div>
        <!-- Gold ornament -->
        <div class="hidden sm:flex items-center gap-3 opacity-60">
          <div style="height:1px; width:48px; background:linear-gradient(90deg,transparent,#c9a84c);"></div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="#c9a84c"><path d="M6 0L12 6L6 12L0 6Z"/></svg>
          <div style="height:1px; width:48px; background:linear-gradient(90deg,#c9a84c,transparent);"></div>
        </div>
      </div>

      <!-- ── Stats grid ── -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-32 rounded-lg animate-pulse" style="background:#e8ddd4;"></div>
          }
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <!-- Products -->
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-3">
              <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.15em; color:#a89585; margin:0;">
                Products
              </p>
              <div class="icon-circle" style="background:rgba(123,28,28,0.06);">
                <svg class="w-5 h-5" fill="none" stroke="#7b1c1c" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
            </div>
            <p style="font-family:'Playfair Display',serif; color:#7b1c1c; font-size:2.25rem; font-weight:700; line-height:1; margin:0 0 4px;">
              {{ stats()!.totalProducts }}
            </p>
            <p style="font-size:0.75rem; color:#a89585; margin:0;">
              <span style="color:#22c55e; font-weight:500;">{{ stats()!.activeProducts }}</span> active
            </p>
          </div>

          <!-- Featured -->
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-3">
              <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.15em; color:#a89585; margin:0;">
                Featured
              </p>
              <div class="icon-circle" style="background:rgba(201,168,76,0.1);">
                <svg class="w-5 h-5" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
            </div>
            <p style="font-family:'Playfair Display',serif; color:#c9a84c; font-size:2.25rem; font-weight:700; line-height:1; margin:0 0 4px;">
              {{ stats()!.featuredProducts }}
            </p>
            <p style="font-size:0.75rem; color:#a89585; margin:0;">featured products</p>
          </div>

          <!-- Categories -->
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-3">
              <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.15em; color:#a89585; margin:0;">
                Categories
              </p>
              <div class="icon-circle" style="background:rgba(123,28,28,0.06);">
                <svg class="w-5 h-5" fill="none" stroke="#7b1c1c" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
            </div>
            <p style="font-family:'Playfair Display',serif; color:#7b1c1c; font-size:2.25rem; font-weight:700; line-height:1; margin:0 0 4px;">
              {{ stats()!.totalCategories }}
            </p>
            <p style="font-size:0.75rem; color:#a89585; margin:0;">active categories</p>
          </div>

          <!-- Customers -->
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-3">
              <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.15em; color:#a89585; margin:0;">
                Customers
              </p>
              <div class="icon-circle" style="background:rgba(201,168,76,0.1);">
                <svg class="w-5 h-5" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
            </div>
            <p style="font-family:'Playfair Display',serif; color:#7b1c1c; font-size:2.25rem; font-weight:700; line-height:1; margin:0 0 4px;">
              {{ stats()!.totalUsers }}
            </p>
            <p style="font-size:0.75rem; color:#a89585; margin:0;">registered users</p>
          </div>
        </div>
      }

      <!-- ── Quick Actions ── -->
      <div class="flex items-center justify-between mb-4">
        <h3 style="font-size:0.875rem; font-weight:600; color:#1a0505; letter-spacing:0.04em; margin:0;">
          Quick Actions
        </h3>
        <div style="height:1px; flex:1; max-width:80px; background:linear-gradient(90deg,transparent,#f0e8df); margin-left:12px;"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <a routerLink="/admin/products" class="action-card">
          <div class="icon-circle" style="background:rgba(123,28,28,0.07);">
            <svg class="w-5 h-5" fill="none" stroke="#7b1c1c" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <p style="font-size:0.875rem; font-weight:600; color:#1a0505; margin:0 0 2px;">Add Product</p>
            <p style="font-size:0.75rem; color:#a89585; margin:0; font-weight:300;">Create a new product listing</p>
          </div>
          <svg class="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="#d4c5b5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
        <a routerLink="/admin/categories" class="action-card">
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);">
            <svg class="w-5 h-5" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <p style="font-size:0.875rem; font-weight:600; color:#1a0505; margin:0 0 2px;">Add Category</p>
            <p style="font-size:0.75rem; color:#a89585; margin:0; font-weight:300;">Organise your collection</p>
          </div>
          <svg class="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="#d4c5b5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
        <a routerLink="/admin/users" class="action-card">
          <div class="icon-circle" style="background:rgba(123,28,28,0.07);">
            <svg class="w-5 h-5" fill="none" stroke="#7b1c1c" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p style="font-size:0.875rem; font-weight:600; color:#1a0505; margin:0 0 2px;">Manage Users</p>
            <p style="font-size:0.75rem; color:#a89585; margin:0; font-weight:300;">View &amp; manage accounts</p>
          </div>
          <svg class="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="#d4c5b5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <!-- ── Brand banner ── -->
      <div class="rounded-lg overflow-hidden" style="background:linear-gradient(135deg,#1a0505,#2a0808,#3d0d0d); position:relative; padding:32px 28px;">
        <!-- Subtle grid pattern -->
        <div class="absolute inset-0" style="background-image:repeating-linear-gradient(0deg,transparent,transparent 29px,rgba(201,168,76,0.04) 29px,rgba(201,168,76,0.04) 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(201,168,76,0.04) 29px,rgba(201,168,76,0.04) 30px);"></div>
        <!-- Top hairline -->
        <div class="absolute top-0 left-0 right-0" style="height:2px; background:linear-gradient(90deg,transparent 5%,#c9a84c55 30%,#c9a84c 50%,#c9a84c55 70%,transparent 95%);"></div>
        <div class="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.3em; color:#c9a84c; margin:0 0 6px;">Rathod · Banjara · Threads</p>
            <p style="font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:600; color:#faf6f0; margin:0 0 6px; font-style:italic;">
              "Wear the Heritage"
            </p>
            <p style="font-size:0.8rem; color:rgba(250,246,240,0.45); font-weight:300; margin:0;">
              Managing your luxury handcrafted collection
            </p>
          </div>
          <a routerLink="/" target="_blank"
             style="background:rgba(201,168,76,0.12); border:1px solid rgba(201,168,76,0.3); color:#c9a84c; border-radius:4px; font-size:0.75rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; padding:10px 20px; text-decoration:none; display:inline-block; transition:background 0.2s;"
             onmouseover="this.style.background='rgba(201,168,76,0.22)'" onmouseout="this.style.background='rgba(201,168,76,0.12)'">
            View Store →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminSvc = inject(AdminService);
  stats   = signal<AdminStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.adminSvc.getStats().subscribe({
      next: (res) => { this.stats.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
