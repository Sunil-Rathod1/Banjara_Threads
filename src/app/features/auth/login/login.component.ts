import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [
  `
    .line-input {
      background: transparent;
      border: none;
      border-bottom: 1.5px solid #d4c5b5;
      border-radius: 0;
      padding: 10px 0 10px 0;
      font-size: 0.9rem;
      color: #1a1a1a;
      width: 100%;
      outline: none;
      transition: border-color 0.25s;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.02em;
    }
    .line-input::placeholder { color: #b8a898; font-weight: 300; }
    .line-input:focus { border-bottom-color: #c9a84c; }
    .line-input.ng-invalid.ng-touched { border-bottom-color: #dc2626; }
    .google-btn {
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .google-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .gold-btn {
      background: linear-gradient(135deg, #c9a84c 0%, #b8943a 50%, #c9a84c 100%);
      background-size: 200% 100%;
      transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s;
    }
    .gold-btn:hover:not(:disabled) {
      background-position: right center;
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(201,168,76,0.4);
    }
    .gold-btn:active:not(:disabled) { transform: translateY(0); }
  `],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-9">
        <p class="text-xs tracking-[0.3em] uppercase mb-3" style="color:#c9a84c; letter-spacing:0.28em;">
          Member Access
        </p>
        <h1 class="mb-2" style="font-family:'Playfair Display',serif; color:#1a0505; font-size:2rem; font-weight:600; line-height:1.2;">
          Welcome Back
        </h1>
        <div class="flex items-center gap-3 mt-3">
          <div class="h-px flex-1" style="background: linear-gradient(90deg, #c9a84c55, transparent);"></div>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a84c" opacity="0.5"><path d="M4 0L8 4L4 8L0 4Z"/></svg>
        </div>
      </div>

      <!-- Google OAuth button -->
      <button
        type="button"
        (click)="signInWithGoogle()"
        class="google-btn w-full flex items-center justify-center gap-3 px-5 py-3.5 text-sm font-medium mb-7"
        style="background:#fff; border: 1.5px solid #e8ddd3; border-radius:4px; color:#2d2d2d;
               box-shadow: 0 1px 8px rgba(0,0,0,0.06); letter-spacing:0.02em;"
      >
        <svg class="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <!-- Ornamental divider -->
      <div class="flex items-center gap-3 mb-7">
        <div class="h-px flex-1" style="background: linear-gradient(90deg, transparent, #d4c5b5);"></div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L13 7L7 13L1 7Z" stroke="#c9a84c" stroke-width="1" fill="rgba(201,168,76,0.1)"/>
          <circle cx="7" cy="7" r="1.5" fill="#c9a84c"/>
        </svg>
        <span class="text-xs" style="color:#a89585; letter-spacing:0.08em; font-weight:300;">or via email</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L13 7L7 13L1 7Z" stroke="#c9a84c" stroke-width="1" fill="rgba(201,168,76,0.1)"/>
          <circle cx="7" cy="7" r="1.5" fill="#c9a84c"/>
        </svg>
        <div class="h-px flex-1" style="background: linear-gradient(90deg, #d4c5b5, transparent);"></div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

        <!-- Email -->
        <div class="mb-7">
          <label class="block text-xs tracking-widest uppercase mb-2"
                 style="color:#a89585; letter-spacing:0.15em; font-weight:500;" for="email">
            Email Address
          </label>
          <input
            id="email" type="email" formControlName="email"
            autocomplete="email" placeholder="you@example.com"
            class="line-input w-full"
            [class.ng-invalid]="isInvalid('email')" [class.ng-touched]="isInvalid('email')"
            (focus)="focusedField='email'" (blur)="focusedField=''"
          />
          @if (isInvalid('email')) {
            <p class="text-xs mt-1.5" style="color:#dc2626; font-weight:300;">{{ getError('email') }}</p>
          }
        </div>

        <!-- Password -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-xs tracking-widest uppercase"
                   style="color:#a89585; letter-spacing:0.15em; font-weight:500;" for="password">
              Password
            </label>
            <a routerLink="/auth/forgot-password"
               class="text-xs transition-colors"
               style="color:#c9a84c; letter-spacing:0.04em;">
              Forgot?
            </a>
          </div>
          <div class="relative">
            <input
              id="password" [type]="showPassword() ? 'text' : 'password'"
              formControlName="password" autocomplete="current-password" placeholder="••••••••"
              class="line-input w-full pr-8"
              [class.ng-invalid]="isInvalid('password')" [class.ng-touched]="isInvalid('password')"
              (focus)="focusedField='password'" (blur)="focusedField=''"
            />
            <button type="button" (click)="showPassword.set(!showPassword())"
              class="absolute right-0 top-1/2 -translate-y-1/2"
              style="color:#a89585; transition: color 0.2s;"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              @if (showPassword()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                </svg>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              }
            </button>
          </div>
          @if (isInvalid('password')) {
            <p class="text-xs mt-1.5" style="color:#dc2626; font-weight:300;">{{ getError('password') }}</p>
          }
        </div>

        <!-- Server error -->
        @if (serverError()) {
          <div class="mb-6 px-4 py-3 text-sm"
               style="background:#fef2f2; color:#991b1b; border-left: 3px solid #ef4444; border-radius:2px;">
            {{ serverError() }}
          </div>
        }

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="loading()"
          class="gold-btn w-full py-4 text-sm font-semibold tracking-[0.12em] uppercase disabled:opacity-60 disabled:cursor-not-allowed"
          style="color:#2a0808; border-radius:3px; letter-spacing:0.12em;"
        >
          @if (loading()) {
            <span class="flex items-center justify-center gap-2.5">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Signing in…
            </span>
          } @else {
            Sign In
          }
        </button>
      </form>

      <!-- Register link -->
      <p class="text-center text-sm mt-7" style="color:#a89585; font-weight:300;">
        New to Rathod Banjara Threads?
        <a routerLink="/auth/register"
           class="ml-1"
           style="color:#7b1c1c; font-weight:500; text-decoration: underline; text-underline-offset:3px;">
          Create Account
        </a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  loading     = signal(false);
  serverError = signal('');
  showPassword = signal(false);
  focusedField = '';

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  signInWithGoogle(): void {
    this.auth.loginWithGoogle();
  }

  // ── Form submit ──────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set('');

    const { email, password } = this.form.getRawValue();

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.serverError.set(
          err.error?.message || 'Something went wrong. Please try again.'
        );
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field) as AbstractControl;
    return ctrl.invalid && ctrl.touched;
  }

  getError(field: string): string {
    const ctrl = this.form.get(field) as AbstractControl;
    if (ctrl.hasError('required'))   return 'This field is required.';
    if (ctrl.hasError('email'))      return 'Please enter a valid email address.';
    if (ctrl.hasError('minlength')) {
      const min = ctrl.getError('minlength').requiredLength;
      return `Minimum ${min} characters required.`;
    }
    return '';
  }
}
