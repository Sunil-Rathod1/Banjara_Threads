import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ── Auth (lazy) ──────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'oauth-callback',
        loadComponent: () =>
          import('./features/auth/oauth-callback/oauth-callback.component').then(
            (m) => m.OAuthCallbackComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Home ─────────────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  // ── Products ─────────────────────────────────────────────────────────────────
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'products/:slug',
    loadComponent: () =>
      import('./features/products/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
  },

  // ── Cart ─────────────────────────────────────────────────────────────────────
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
  },

  // ── Account ──────────────────────────────────────────────────────────────────
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent),
    canActivate: [authGuard],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/products.component').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories.component').then((m) => m.AdminCategoriesComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then((m) => m.AdminUsersComponent),
      },
    ],
  },

  // ── Wildcard ─────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
