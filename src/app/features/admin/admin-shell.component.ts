import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  styles: [`
    :host { display: flex; min-height: 100vh; }
    .sidebar { width: 220px; flex-shrink: 0; background: linear-gradient(180deg, #1a0505 0%, #2a0808 100%);
               display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
    .nav-link { display: flex; align-items: center; gap: 12px; padding: 11px 20px; font-size: 0.8rem;
                font-weight: 500; letter-spacing: 0.03em; color: rgba(250,246,240,0.55);
                border-left: 3px solid transparent; transition: all 0.2s; text-decoration: none; }
    .nav-link:hover { color: #faf6f0; background: rgba(201,168,76,0.06); border-left-color: rgba(201,168,76,0.3); }
    .nav-link.active { color: #c9a84c; border-left-color: #c9a84c; background: rgba(201,168,76,0.08); }
    .main { flex: 1; background: #f5f0ea; min-height: 100vh; overflow-y: auto; }
    .topbar { background: #fff; border-bottom: 1px solid #f0e8df; padding: 0 28px; height: 58px;
              display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  `],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-2 px-5 py-5 border-b" style="border-color:rgba(201,168,76,0.12);">
        <img src="logo.png" class="w-8 h-8" style="border-radius:50%; object-fit:cover;" />
        <div>
          <p class="text-xs font-semibold leading-none" style="color:#c9a84c; font-family:'Playfair Display',serif;">Admin</p>
          <p class="text-[9px] mt-0.5" style="color:rgba(250,246,240,0.35); letter-spacing:0.15em; text-transform:uppercase;">Panel</p>
        </div>
      </a>

      <!-- Nav -->
      <nav class="flex-1 py-4">
        <p class="px-5 text-[9px] uppercase tracking-widest mb-2" style="color:rgba(201,168,76,0.4); letter-spacing:0.2em;">Overview</p>
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </a>

        <p class="px-5 text-[9px] uppercase tracking-widest mt-5 mb-2" style="color:rgba(201,168,76,0.4); letter-spacing:0.2em;">Catalogue</p>
        <a routerLink="/admin/products" routerLinkActive="active" class="nav-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Products
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          Categories
        </a>

        <p class="px-5 text-[9px] uppercase tracking-widest mt-5 mb-2" style="color:rgba(201,168,76,0.4); letter-spacing:0.2em;">People</p>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Users
        </a>
      </nav>

      <!-- User footer -->
      <div class="px-5 py-4 border-t" style="border-color:rgba(201,168,76,0.12);">
        <p class="text-xs font-medium truncate" style="color:#faf6f0;">{{ auth.currentUser?.name }}</p>
        <p class="text-[10px] mt-0.5 mb-3" style="color:rgba(201,168,76,0.6);">Administrator</p>
        <div class="flex gap-2">
          <a routerLink="/" class="flex-1 text-center text-[10px] py-1.5 rounded" style="background:rgba(201,168,76,0.1);color:#c9a84c;">
            ← Store
          </a>
          <button (click)="auth.logout()" class="flex-1 text-[10px] py-1.5 rounded" style="background:rgba(250,246,240,0.06);color:rgba(250,246,240,0.5);">
            Sign Out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main area -->
    <div class="main">
      <!-- Top bar -->
      <div class="topbar">
        <h1 class="text-sm font-semibold" style="color:#1a0505; font-family:'Playfair Display',serif; letter-spacing:0.03em;">
          Rathod Banjara Threads — Admin
        </h1>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium" style="background:rgba(123,28,28,0.08);color:#7b1c1c;">
          Admin
        </span>
      </div>
      <div class="p-7">
        <router-outlet />
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
}
