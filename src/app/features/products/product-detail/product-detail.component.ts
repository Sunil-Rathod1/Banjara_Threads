import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category, Review } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe, DatePipe],
  styles: [`
    :host { display: block; }
    .thumb { transition: opacity 0.2s, border-color 0.2s; cursor: pointer; }
    .thumb:hover, .thumb.active { opacity: 1; border-color: #c9a84c; }
    .thumb:not(.active) { opacity: 0.55; border-color: transparent; }
    .add-btn { background: linear-gradient(135deg,#c9a84c,#b8943a,#c9a84c); background-size:200% 100%;
               transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s; letter-spacing:0.1em; }
    .add-btn:hover:not(:disabled) { background-position:right center; transform:translateY(-1px); box-shadow:0 8px 28px rgba(201,168,76,0.38); }
    .wishlist-btn { transition: color 0.2s, border-color 0.2s; }
    .wishlist-btn:hover { border-color:#7b1c1c; color:#7b1c1c; }
    .review-star { cursor: pointer; transition: transform 0.1s; }
    .review-star:hover { transform: scale(1.15); }
  `],
  template: `
    <div class="min-h-screen" style="background:#faf6f0;">

      <!-- Breadcrumb -->
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <nav class="text-xs flex items-center gap-2" style="color:#a89585;">
          <a routerLink="/" style="color:#7b1c1c;">Home</a>
          <span>/</span>
          <a routerLink="/products" style="color:#7b1c1c;">Products</a>
          @if (product()) {
            <span>/</span>
            <span style="color:#5a4040;">{{ product()!.name }}</span>
          }
        </nav>
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row gap-12">
            <div class="flex-1 rounded-sm" style="aspect-ratio:1; background:linear-gradient(90deg,#f0e8df,#faf6f0,#f0e8df);animation:pulse 1.5s ease-in-out infinite;background-size:200% 100%;"></div>
            <div class="flex-1 space-y-4">
              <div class="h-5 rounded w-1/3" style="background:#f0e8df;"></div>
              <div class="h-8 rounded w-3/4" style="background:#f0e8df;"></div>
              <div class="h-4 rounded w-1/4" style="background:#f0e8df;"></div>
            </div>
          </div>
        </div>
      }

      <!-- Not found -->
      @if (!loading() && !product()) {
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-24 text-center">
          <p class="text-2xl mb-4" style="font-family:'Playfair Display',serif; color:#5a4040;">Product not found</p>
          <a routerLink="/products" class="text-sm" style="color:#c9a84c;">← Back to Products</a>
        </div>
      }

      <!-- Product content -->
      @if (!loading() && product(); as p) {
        <div class="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
          <div class="flex flex-col lg:flex-row gap-12 py-6">

            <!-- ── Images ───────────────────────────────────────────────────── -->
            <div class="lg:w-[52%] flex gap-4">
              <!-- Thumbnails -->
              @if (p.images.length > 1) {
                <div class="flex flex-col gap-2 w-16">
                  @for (img of p.images; track img.url; let i = $index) {
                    <button class="thumb border rounded-sm overflow-hidden flex-shrink-0 h-16"
                      [class.active]="activeImageIdx() === i"
                      (click)="activeImageIdx.set(i)"
                      style="border-width:1.5px;">
                      <img [src]="img.url" [alt]="img.alt || p.name" class="w-full h-full object-cover" />
                    </button>
                  }
                </div>
              }
              <!-- Main image -->
              <div class="flex-1 relative rounded-sm overflow-hidden" style="aspect-ratio:1; background:#f5ece1;">
                @if (p.images.length > 0) {
                  <img [src]="p.images[activeImageIdx()].url"
                       [alt]="p.images[activeImageIdx()].alt || p.name"
                       class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-6xl opacity-20">🧵</div>
                }
                <!-- Sale badge -->
                @if (p.comparePrice && p.comparePrice > p.price) {
                  <span class="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1" style="background:#7b1c1c;color:#fff;border-radius:2px;">
                    Save {{ discountPct(p) }}%
                  </span>
                }
              </div>
            </div>

            <!-- ── Info panel ───────────────────────────────────────────────── -->
            <div class="lg:w-[48%]">
              <!-- Category + badge -->
              <p class="text-xs tracking-[0.2em] uppercase mb-4" style="color:#c9a84c; letter-spacing:0.2em;">
                {{ catName(p) }}
              </p>

              <h1 class="mb-3 leading-tight" style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:600; color:#1a0505; line-height:1.15;">
                {{ p.name }}
              </h1>

              <!-- Rating -->
              @if (p.ratings.count > 0) {
                <div class="flex items-center gap-2 mb-4">
                  <div class="flex gap-0.5">
                    @for (s of stars(p.ratings.average); track $index) {
                      <svg width="14" height="14" viewBox="0 0 24 24" [attr.fill]="s === 'full' ? '#c9a84c' : 'none'" stroke="#c9a84c" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    }
                  </div>
                  <span class="text-sm" style="color:#a89585;">{{ p.ratings.average }} ({{ p.ratings.count }} review{{ p.ratings.count !== 1 ? 's' : '' }})</span>
                </div>
              }

              <!-- Price -->
              <div class="flex items-baseline gap-3 mb-5">
                <span style="font-size:1.65rem; font-weight:600; color:#7b1c1c; font-family:'Playfair Display',serif;">
                  ₹{{ p.price | number:'1.0-0' }}
                </span>
                @if (p.comparePrice && p.comparePrice > p.price) {
                  <span class="text-base line-through" style="color:#c4b5a5;">₹{{ p.comparePrice | number:'1.0-0' }}</span>
                  <span class="text-xs font-semibold px-2 py-0.5" style="background:rgba(123,28,28,0.08);color:#7b1c1c;border-radius:2px;">
                    {{ discountPct(p) }}% OFF
                  </span>
                }
              </div>

              <!-- Gold divider -->
              <div class="h-px w-full mb-5" style="background:linear-gradient(90deg,#c9a84c44,transparent);"></div>

              <!-- Short desc -->
              @if (p.shortDescription) {
                <p class="mb-5 leading-relaxed" style="color:#5a4040; font-weight:300; font-size:0.95rem;">
                  {{ p.shortDescription }}
                </p>
              }

              <!-- Stock status -->
              <div class="flex items-center gap-2 mb-6">
                @if (p.inStock) {
                  <span class="w-2 h-2 rounded-full inline-block" style="background:#22c55e;"></span>
                  <span class="text-sm" style="color:#22c55e; font-weight:400;">In Stock ({{ p.stock }})</span>
                } @else {
                  <span class="w-2 h-2 rounded-full inline-block" style="background:#ef4444;"></span>
                  <span class="text-sm" style="color:#ef4444;">Out of Stock</span>
                }
              </div>

              <!-- Quantity + Add to Cart -->
              <div class="flex items-center gap-3 mb-4">
                <!-- Qty -->
                <div class="flex items-center border" style="border-color:#d4c5b5; border-radius:3px; overflow:hidden;">
                  <button (click)="qty.set(qty() > 1 ? qty()-1 : 1)"
                    class="w-10 h-12 text-xl flex items-center justify-center" style="color:#7b1c1c;">−</button>
                  <span class="w-10 h-12 flex items-center justify-center text-sm font-medium" style="border-left:1px solid #d4c5b5;border-right:1px solid #d4c5b5;">{{ qty() }}</span>
                  <button (click)="qty.set(qty() < (product()?.stock ?? 1) ? qty()+1 : qty())"
                    class="w-10 h-12 text-xl flex items-center justify-center" style="color:#7b1c1c;">+</button>
                </div>
                <!-- Add -->
                <button (click)="addToCart()"
                  [disabled]="!p.inStock || addingToCart()"
                  class="add-btn flex-1 py-3.5 text-sm font-semibold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  style="color:#2a0808; border-radius:3px;">
                  @if (addingToCart()) { <span>Adding…</span> }
                  @else if (addedMsg()) { <span>✓ Added</span> }
                  @else { <span>Add to Cart</span> }
                </button>
              </div>

              @if (cartError()) {
                <p class="text-xs mb-3" style="color:#dc2626;">{{ cartError() }}</p>
              }

              <!-- Tags -->
              @if (p.tags.length > 0) {
                <div class="flex flex-wrap gap-2 mt-4">
                  @for (tag of p.tags; track tag) {
                    <span class="text-xs px-2.5 py-1" style="background:rgba(201,168,76,0.1); color:#7b1c1c; border-radius:2px; border:1px solid rgba(201,168,76,0.3);">
                      {{ tag }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- ── Description ─────────────────────────────────────────────────── -->
          @if (p.description) {
            <div class="border-t py-10" style="border-color:#f0e8df;">
              <h2 class="text-xl mb-4" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">About This Product</h2>
              <p class="leading-relaxed max-w-3xl" style="color:#5a4040; font-weight:300; white-space:pre-line;">{{ p.description }}</p>
            </div>
          }

          <!-- ── Reviews ─────────────────────────────────────────────────────── -->
          <div class="border-t py-10" style="border-color:#f0e8df;">
            <h2 class="text-xl mb-6" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">
              Reviews ({{ p.reviews.length }})
            </h2>

            <!-- Review list -->
            @if (p.reviews.length === 0) {
              <p class="text-sm mb-6" style="color:#a89585; font-weight:300;">No reviews yet. Be the first to share your experience.</p>
            }
            @for (rev of p.reviews; track rev._id) {
              <div class="mb-6 pb-6 border-b" style="border-color:#f0e8df;">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style="background:linear-gradient(135deg,#7b1c1c,#c9a84c);color:#fff;">
                    {{ rev.name[0].toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-sm" style="color:#1a0505;">{{ rev.name }}</p>
                    <p class="text-xs" style="color:#a89585;">{{ rev.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="ml-auto flex gap-0.5">
                    @for (s of stars(rev.rating); track $index) {
                      <svg width="12" height="12" viewBox="0 0 24 24" [attr.fill]="s==='full'?'#c9a84c':'none'" stroke="#c9a84c" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    }
                  </div>
                </div>
                @if (rev.comment) {
                  <p class="text-sm leading-relaxed ml-11" style="color:#5a4040; font-weight:300;">{{ rev.comment }}</p>
                }
              </div>
            }

            <!-- Write review -->
            @if (auth.currentUser) {
              <div class="mt-6">
                <h3 class="text-base mb-4" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">Write a Review</h3>
                <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                  <!-- Star rating -->
                  <div class="flex items-center gap-1 mb-4">
                    @for (n of [1,2,3,4,5]; track n) {
                      <button type="button" (click)="reviewForm.patchValue({rating:n})"
                        class="review-star">
                        <svg width="24" height="24" viewBox="0 0 24 24"
                          [attr.fill]="(reviewForm.value.rating ?? 0) >= n ? '#c9a84c' : 'none'"
                          stroke="#c9a84c" stroke-width="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    }
                  </div>
                  <textarea formControlName="comment" rows="3" placeholder="Share your experience…"
                    class="w-full text-sm p-3 outline-none resize-none mb-4"
                    style="border:1.5px solid #d4c5b5; border-radius:3px; background:transparent; font-family:Inter,sans-serif; color:#1a1a1a;"></textarea>
                  @if (reviewError()) {
                    <p class="text-xs mb-3" style="color:#dc2626;">{{ reviewError() }}</p>
                  }
                  <button type="submit" [disabled]="reviewForm.invalid || submittingReview()"
                    class="add-btn px-8 py-3 text-sm font-semibold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    style="color:#2a0808; border-radius:3px;">
                    {{ submittingReview() ? 'Submitting…' : 'Submit Review' }}
                  </button>
                </form>
              </div>
            } @else {
              <p class="text-sm" style="color:#a89585; font-weight:300;">
                <a routerLink="/auth/login" style="color:#7b1c1c; text-decoration:underline; text-underline-offset:3px;">Sign in</a>
                to write a review.
              </p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc    = inject(CartService);
  readonly auth      = inject(AuthService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private fb         = inject(FormBuilder);

  product        = signal<Product | null>(null);
  loading        = signal(true);
  activeImageIdx = signal(0);
  qty            = signal(1);
  addingToCart   = signal(false);
  addedMsg       = signal(false);
  cartError      = signal('');
  submittingReview = signal(false);
  reviewError    = signal('');

  reviewForm = this.fb.group({
    rating:  [0, [Validators.required, Validators.min(1)]],
    comment: [''],
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.productSvc.getProductBySlug(slug).subscribe({
      next: (res) => { this.product.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  addToCart() {
    if (!this.auth.currentUser) { this.router.navigate(['/auth/login']); return; }
    this.addingToCart.set(true);
    this.cartError.set('');
    this.cartSvc.addItem(this.product()!._id, this.qty()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.addedMsg.set(true);
        this.cartSvc.open();
        setTimeout(() => this.addedMsg.set(false), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.addingToCart.set(false);
        this.cartError.set(err.error?.message || 'Failed to add to cart.');
      },
    });
  }

  submitReview() {
    if (this.reviewForm.invalid) return;
    this.submittingReview.set(true);
    this.reviewError.set('');
    const { rating, comment } = this.reviewForm.getRawValue();
    this.productSvc.addReview(this.product()!.slug, rating!, comment || '').subscribe({
      next: () => {
        // Reload product to get updated reviews
        this.productSvc.getProductBySlug(this.product()!.slug).subscribe((res) => {
          this.product.set(res.data);
          this.submittingReview.set(false);
          this.reviewForm.reset({ rating: 0, comment: '' });
        });
      },
      error: (err: HttpErrorResponse) => {
        this.submittingReview.set(false);
        this.reviewError.set(err.error?.message || 'Failed to submit review.');
      },
    });
  }

  discountPct(p: Product): number {
    if (!p.comparePrice) return 0;
    return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
  }

  catName(p: Product): string {
    return typeof p.category === 'object' ? (p.category as Category).name : '';
  }

  stars(avg: number): ('full' | 'half' | 'empty')[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (avg >= i + 1) return 'full';
      if (avg >= i + 0.5) return 'half';
      return 'empty';
    });
  }
}
