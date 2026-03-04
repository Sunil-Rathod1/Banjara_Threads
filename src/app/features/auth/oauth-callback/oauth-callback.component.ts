import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Landing page for the Google OAuth redirect.
 * URL: /auth/oauth-callback?token=<jwt>
 *
 * Extracts the token from the URL, persists it via AuthService,
 * then navigates to the home page (or the original returnUrl).
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center" style="background-color:#faf6f0;">
      <div class="text-center">
        <div class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
             style="background: linear-gradient(135deg, #7b1c1c, #c9a84c);">
          <svg class="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-500">{{ message }}</p>
      </div>
    </div>
  `,
})
export class OAuthCallbackComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private auth   = inject(AuthService);

  message = 'Completing sign-in…';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !token) {
      this.message = 'Sign-in failed. Redirecting…';
      setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { error: 'oauth_failed' } }), 1500);
      return;
    }

    this.auth.handleOAuthCallback(token).subscribe({
      next: () => {
        this.message = 'Welcome! Taking you home…';
        this.router.navigate(['/']);
      },
      error: () => {
        this.message = 'Sign-in failed. Redirecting…';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
    });
  }
}
