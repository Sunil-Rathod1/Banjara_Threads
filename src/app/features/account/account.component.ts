import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  styles: [`
    :host { display: block; }
    .tab-btn { transition: color 0.2s, border-color 0.2s; }
    .tab-btn:hover { color: #7b1c1c; }
    .line-input {
      background: transparent; border: none; border-bottom: 1.5px solid #d4c5b5; border-radius: 0;
      padding: 10px 0; font-size: 0.9rem; color: #1a1a1a; width: 100%; outline: none;
      transition: border-color 0.25s; font-family: 'Inter', sans-serif;
    }
    .line-input::placeholder { color: #b8a898; font-weight: 300; }
    .line-input:focus { border-bottom-color: #c9a84c; }
    .save-btn { background: linear-gradient(135deg,#7b1c1c,#5a1010); letter-spacing:0.1em;
               transition: transform 0.15s, box-shadow 0.2s; }
    .save-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(123,28,28,0.28); }
  `],
  template: `
    <div class="min-h-screen" style="background:#faf6f0;">

      <!-- Header banner -->
      <div class="py-10 text-center" style="background:linear-gradient(140deg,#2a0808,#7b1c1c);">
        <div class="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
             style="background:linear-gradient(135deg,#c9a84c,#b8943a); box-shadow:0 4px 16px rgba(201,168,76,0.3);">
          {{ (auth.currentUser?.name || 'U')[0].toUpperCase() }}
        </div>
        <p class="text-xs tracking-[0.3em] uppercase mb-1" style="color:#c9a84c; letter-spacing:0.28em;">My Account</p>
        <h1 class="text-2xl" style="font-family:'Playfair Display',serif; color:#faf6f0; font-weight:600;">
          {{ auth.currentUser?.name }}
        </h1>
        <p class="text-sm mt-1" style="color:rgba(250,246,240,0.5); font-weight:300;">{{ auth.currentUser?.email }}</p>
      </div>

      <div class="max-w-3xl mx-auto px-4 lg:px-8 py-10">

        <!-- Tabs -->
        <div class="flex gap-6 mb-8 border-b" style="border-color:#f0e8df;">
          @for (tab of tabs; track tab.key) {
            <button (click)="activeTab.set(tab.key)"
              class="tab-btn pb-3 text-sm font-medium"
              [style.color]="activeTab() === tab.key ? '#7b1c1c' : '#a89585'"
              [style.border-bottom]="activeTab() === tab.key ? '2px solid #c9a84c' : '2px solid transparent'"
              style="margin-bottom:-1px;">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- ── Profile tab ────────────────────────────────────────────────────── -->
        @if (activeTab() === 'profile') {
          <div class="max-w-md">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="mb-7">
                <label class="block text-xs tracking-widest uppercase mb-2" style="color:#a89585;letter-spacing:0.15em;">Full Name</label>
                <input type="text" formControlName="name" class="line-input" placeholder="Your name" />
              </div>
              <div class="mb-7">
                <label class="block text-xs tracking-widest uppercase mb-2" style="color:#a89585;letter-spacing:0.15em;">Email Address</label>
                <input type="email" formControlName="email" class="line-input" placeholder="you@example.com" readonly
                       style="opacity:0.5; cursor:not-allowed;" />
                <p class="text-xs mt-1" style="color:#a89585; font-weight:300;">Email cannot be changed</p>
              </div>

              @if (profileSuccess()) {
                <div class="mb-4 px-4 py-3 text-sm" style="background:#f0fdf4;color:#15803d;border-left:3px solid #22c55e;border-radius:2px;">
                  Profile updated successfully!
                </div>
              }
              @if (profileError()) {
                <div class="mb-4 px-4 py-3 text-sm" style="background:#fef2f2;color:#991b1b;border-left:3px solid #ef4444;border-radius:2px;">
                  {{ profileError() }}
                </div>
              }

              <button type="submit" [disabled]="savingProfile()"
                class="save-btn px-8 py-3.5 text-sm font-semibold uppercase text-white disabled:opacity-60"
                style="border-radius:3px;">
                {{ savingProfile() ? 'Saving…' : 'Save Changes' }}
              </button>
            </form>
          </div>
        }

        <!-- ── Password tab ───────────────────────────────────────────────────── -->
        @if (activeTab() === 'password') {
          <div class="max-w-md">
            @if (auth.currentUser?.authProvider === 'google') {
              <div class="px-4 py-4 text-sm" style="background:rgba(201,168,76,0.08);color:#7b1c1c;border-left:3px solid #c9a84c;border-radius:2px;">
                You signed in with Google. Password management is not available for social accounts.
              </div>
            } @else {
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="mb-6">
                  <label class="block text-xs tracking-widest uppercase mb-2" style="color:#a89585;letter-spacing:0.15em;">Current Password</label>
                  <input type="password" formControlName="currentPassword" class="line-input" placeholder="••••••••" />
                </div>
                <div class="mb-6">
                  <label class="block text-xs tracking-widest uppercase mb-2" style="color:#a89585;letter-spacing:0.15em;">New Password</label>
                  <input type="password" formControlName="newPassword" class="line-input" placeholder="Min. 8 characters" />
                </div>
                <div class="mb-8">
                  <label class="block text-xs tracking-widest uppercase mb-2" style="color:#a89585;letter-spacing:0.15em;">Confirm New Password</label>
                  <input type="password" formControlName="confirmPassword" class="line-input" placeholder="Repeat new password" />
                </div>

                @if (pwSuccess()) {
                  <div class="mb-4 px-4 py-3 text-sm" style="background:#f0fdf4;color:#15803d;border-left:3px solid #22c55e;border-radius:2px;">
                    Password changed successfully!
                  </div>
                }
                @if (pwError()) {
                  <div class="mb-4 px-4 py-3 text-sm" style="background:#fef2f2;color:#991b1b;border-left:3px solid #ef4444;border-radius:2px;">
                    {{ pwError() }}
                  </div>
                }

                <button type="submit" [disabled]="changingPw()"
                  class="save-btn px-8 py-3.5 text-sm font-semibold uppercase text-white disabled:opacity-60"
                  style="border-radius:3px;">
                  {{ changingPw() ? 'Updating…' : 'Update Password' }}
                </button>
              </form>
            }
          </div>
        }

        <!-- ── Orders tab (placeholder) ──────────────────────────────────────── -->
        @if (activeTab() === 'orders') {
          <div class="text-center py-16">
            <div class="text-4xl mb-4 opacity-25">📦</div>
            <p class="text-lg mb-2" style="font-family:'Playfair Display',serif; color:#5a4040;">No orders yet</p>
            <p class="text-sm mb-6" style="color:#a89585; font-weight:300;">Your order history will appear here</p>
            <a routerLink="/products" class="inline-block px-8 py-3 text-sm font-semibold"
               style="background:linear-gradient(135deg,#c9a84c,#b8943a); color:#2a0808; border-radius:3px; letter-spacing:0.08em;">
              Start Shopping
            </a>
          </div>
        }

      </div>
    </div>
  `,
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  private http  = inject(HttpClient);
  private fb    = inject(FormBuilder);

  activeTab = signal<'profile' | 'password' | 'orders'>('profile');

  tabs = [
    { key: 'profile',  label: 'Profile'  },
    { key: 'password', label: 'Password' },
    { key: 'orders',   label: 'Orders'   },
  ] as const;

  savingProfile  = signal(false);
  profileSuccess = signal(false);
  profileError   = signal('');

  changingPw = signal(false);
  pwSuccess  = signal(false);
  pwError    = signal('');

  profileForm = this.fb.group({
    name:  ['', [Validators.required, Validators.maxLength(60)]],
    email: [''],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit() {
    const u = this.auth.currentUser;
    if (u) {
      this.profileForm.patchValue({ name: u.name, email: u.email });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.profileSuccess.set(false);
    this.profileError.set('');
    const { name } = this.profileForm.getRawValue();
    this.http.put<any>(`${environment.apiUrl}/auth/me`, { name }).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        this.profileSuccess.set(true);
        // Update stored user
        if (res.data) this.auth.updateCurrentUser(res.data);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.savingProfile.set(false);
        this.profileError.set(err.error?.message || 'Failed to save profile.');
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.pwError.set('Passwords do not match.');
      return;
    }
    this.changingPw.set(true);
    this.pwSuccess.set(false);
    this.pwError.set('');
    this.http.put<any>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPw.set(false);
        this.pwSuccess.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.pwSuccess.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.changingPw.set(false);
        this.pwError.set(err.error?.message || 'Failed to update password.');
      },
    });
  }
}
