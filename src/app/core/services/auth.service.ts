import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  User,
  AuthResponse,
  ApiResponse,
  LoginPayload,
  RegisterPayload,
} from '../models/user.model';

const TOKEN_KEY = 'rbt_token';
const USER_KEY  = 'rbt_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // ── Getters ──────────────────────────────────────────────────────────────────
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Local auth ───────────────────────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.base}/register`, payload)
      .pipe(tap((res) => this.persist(res.data!)));
  }

  login(payload: LoginPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.base}/login`, payload)
      .pipe(tap((res) => this.persist(res.data!)));
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  /**
   * Kick off the Google OAuth flow by navigating the browser to the backend
   * endpoint. The backend (Passport) will redirect to Google, then back to
   * /api/auth/google/callback, which will redirect to Angular's oauth-callback
   * route with ?token=<jwt>.
   */
  loginWithGoogle(): void {
    window.location.href = environment.googleOAuthUrl;
  }

  /**
   * Called by the OAuthCallbackComponent after the redirect lands.
   * Stores the token + fetches the full user profile.
   */
  handleOAuthCallback(token: string): Observable<ApiResponse<User>> {
    localStorage.setItem(TOKEN_KEY, token);
    return this.http.get<ApiResponse<User>>(`${this.base}/me`).pipe(
      tap((res) => {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        this.currentUserSubject.next(res.data!);
      })
    );
  }

  // ── Profile ──────────────────────────────────────────────────────────────────
  fetchMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/me`).pipe(
      tap((res) => {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        this.currentUserSubject.next(res.data!);
      })
    );
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // ── Logout ───────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────
  private persist(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
