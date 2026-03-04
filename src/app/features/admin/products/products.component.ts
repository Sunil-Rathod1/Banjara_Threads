import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Product, Category } from '../../../core/models/product.model';

interface ProdForm {
  name: string; shortDescription: string; description: string;
  price: number | null; comparePrice: number | null; stock: number;
  sku: string; categoryId: string; tags: string; isFeatured: boolean; isActive: boolean;
  imageUrl: string; imageAlt: string;
}

const blankForm = (): ProdForm => ({
  name: '', shortDescription: '', description: '', price: null, comparePrice: null,
  stock: 0, sku: '', categoryId: '', tags: '', isFeatured: false, isActive: true,
  imageUrl: '', imageAlt: '',
});

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  styles: [`
    .input { background:#faf6f0; border:1.5px solid #e8ddd4; border-radius:6px; padding:9px 12px; font-size:0.875rem;
             color:#1a1a1a; width:100%; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
    .input:focus { border-color:#c9a84c; box-shadow:0 0 0 3px rgba(201,168,76,0.12); }
    .textarea { background:#faf6f0; border:1.5px solid #e8ddd4; border-radius:6px; padding:9px 12px; font-size:0.875rem;
                color:#1a1a1a; width:100%; outline:none; transition:border-color 0.2s; resize:vertical; }
    .textarea:focus { border-color:#c9a84c; }
    .btn-gold { background:linear-gradient(135deg,#c9a84c,#a8872e); color:#fff; font-size:0.75rem; font-weight:700;
                letter-spacing:0.1em; padding:10px 24px; border-radius:6px; transition:all 0.2s; text-transform:uppercase; }
    .btn-gold:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(201,168,76,0.35); }
    .btn-gold:disabled { opacity:0.5; transform:none; cursor:not-allowed; }
    .btn-outline { font-size:0.75rem; font-weight:600; letter-spacing:0.08em; padding:10px 24px; border-radius:6px;
                   border:1.5px solid #e8ddd4; color:#7b1c1c; transition:all 0.2s; text-transform:uppercase; }
    .btn-outline:hover { border-color:#7b1c1c; background:#fef5f5; }
    .overlay { position:fixed; inset:0; background:rgba(10,2,2,0.65); backdrop-filter:blur(6px); z-index:50;
               display:flex; align-items:flex-start; justify-content:center; padding:32px 16px; overflow-y:auto; }
    .modal  { background:#fff; border-radius:12px; width:100%; max-width:600px;
              box-shadow:0 32px 80px rgba(0,0,0,0.25); overflow:hidden; }
    .modal-header { padding:24px 28px 20px; border-bottom:1px solid #f0e8df; }
    .modal-body   { padding:24px 28px; max-height:72vh; overflow-y:auto; }
    .modal-footer { padding:20px 28px; border-top:1px solid #f0e8df; background:#faf6f0; }
    .upload-zone { border:2px dashed #d4c5b5; border-radius:10px; cursor:pointer;
                   transition:all 0.2s; background:#faf6f0; }
    .upload-zone:hover,.upload-zone.drag-over { border-color:#c9a84c; background:#fdf8ef;
                                                box-shadow:0 0 0 4px rgba(201,168,76,0.08); }
    .upload-zone.has-image { border:2px solid #c9a84c; padding:0; overflow:hidden; position:relative; }
    .card-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #f5ede6;
                transition:background 0.15s; }
    .card-row:last-child { border-bottom:none; }
    .card-row:hover { background:#fdfaf7; }
    .thumb { width:52px; height:52px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1px solid #f0e8df; }
    .thumb-placeholder { width:52px; height:52px; border-radius:8px; flex-shrink:0; display:flex; align-items:center;
                         justify-content:center; background:#f5ede6; border:1px solid #f0e8df; }
  `],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 style="font-family:'Playfair Display',serif;color:#1a0505;font-weight:700;font-size:1.35rem;">Products</h2>
          <p class="text-sm mt-0.5" style="color:#a89585;">{{ total() }} product(s) in catalogue</p>
        </div>
        <button (click)="openCreate()" class="btn-gold flex items-center gap-2">
          <span style="font-size:1.1rem;line-height:1;">+</span> New Product
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:#c9a84c;"
             fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
        </svg>
        <input [(ngModel)]="searchQ" (ngModelChange)="onSearchChange()" placeholder="Search productsâ€¦"
               class="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all"
               style="border-color:#e8ddd4;background:#fff;color:#1a0505;" />
      </div>

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="rounded-xl border overflow-hidden" style="border-color:#f0e8df;">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex items-center gap-4 px-5 py-4 border-b" style="border-color:#f5ede6;">
              <div class="w-13 h-13 rounded-lg animate-pulse" style="width:52px;height:52px;background:#e8ddd4;flex-shrink:0;"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 rounded animate-pulse w-48" style="background:#e8ddd4;"></div>
                <div class="h-2.5 rounded animate-pulse w-28" style="background:#f0e8df;"></div>
              </div>
              <div class="h-3 rounded animate-pulse w-16" style="background:#e8ddd4;"></div>
            </div>
          }
        </div>

      } @else if (products().length === 0) {
        <div class="text-center py-16 rounded-xl border" style="border-color:#f0e8df;background:#faf6f0;">
          <svg class="w-12 h-12 mx-auto mb-3" style="color:#d4c5b5;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
          </svg>
          <p style="color:#a89585;">No products found.</p>
        </div>

      } @else {
        <!-- Product list -->
        <div class="rounded-xl border overflow-hidden" style="border-color:#f0e8df;background:#fff;">
          <!-- Column headers -->
          <div class="flex items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
               style="background:#faf6f0;border-bottom:1px solid #f0e8df;color:#c4a882;letter-spacing:0.13em;">
            <div style="width:52px;flex-shrink:0;"></div>
            <div class="flex-1">Product</div>
            <div class="w-28 text-center hidden md:block">Category</div>
            <div class="w-20 text-right">Price</div>
            <div class="w-16 text-center hidden sm:block">Stock</div>
            <div class="w-20 text-center">Status</div>
            <div class="w-24"></div>
          </div>

          @for (p of products(); track p._id) {
            <div class="card-row">
              <!-- Thumbnail -->
              @if (p.images?.[0]?.url) {
                <img [src]="p.images[0].url" [alt]="p.images[0].alt || p.name" class="thumb" />
              } @else {
                <div class="thumb-placeholder">
                  <svg class="w-5 h-5" style="color:#d4c5b5;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                  </svg>
                </div>
              }

              <!-- Name + badges -->
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm truncate" style="color:#1a0505;">{{ p.name }}</div>
                <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  @if (p.isFeatured) {
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide"
                          style="background:rgba(201,168,76,0.15);color:#a8872e;">â˜… FEATURED</span>
                  }
                  @if (p.sku) {
                    <span class="text-[10px]" style="color:#c4a882;">{{ p.sku }}</span>
                  }
                </div>
              </div>

              <!-- Category -->
              <div class="w-28 text-center text-xs hidden md:block" style="color:#a89585;">{{ getCatName(p) }}</div>

              <!-- Price -->
              <div class="w-20 text-right">
                <div class="text-sm font-bold" style="color:#7b1c1c;">â‚¹{{ p.price | number:'1.0-0' }}</div>
                @if (p.comparePrice) {
                  <div class="text-[10px] line-through" style="color:#c4a882;">â‚¹{{ p.comparePrice | number:'1.0-0' }}</div>
                }
              </div>

              <!-- Stock -->
              <div class="w-16 text-center hidden sm:block">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      [style]="p.stock === 0 ? 'background:#fef2f2;color:#dc2626;' : p.stock < 5 ? 'background:#fffbeb;color:#d97706;' : 'background:#f0fdf4;color:#16a34a;'">
                  {{ p.stock }}
                </span>
              </div>

              <!-- Status -->
              <div class="w-20 text-center">
                <span class="text-[10px] px-2 py-1 rounded-full font-bold tracking-wide uppercase"
                      [style]="p.isActive ? 'background:#f0fdf4;color:#16a34a;' : 'background:#fef2f2;color:#dc2626;'">
                  {{ p.isActive ? 'Live' : 'Draft' }}
                </span>
              </div>

              <!-- Actions -->
              <div class="w-24 flex items-center justify-end gap-2">
                <button (click)="openEdit(p)"
                        class="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                        style="background:#faf6f0;color:#7b1c1c;border:1px solid #e8ddd4;"
                        onmouseover="this.style.background='#fef0e6'" onmouseout="this.style.background='#faf6f0'">Edit</button>
                <button (click)="confirmDelete(p)"
                        class="text-xs px-2 py-1.5 rounded-md transition-colors"
                        style="color:#c4a882;border:1px solid transparent;"
                        onmouseover="this.style.borderColor='#f0e8df';this.style.color='#dc2626'" onmouseout="this.style.borderColor='transparent';this.style.color='#c4a882'">Del</button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between mt-5">
            <button (click)="changePage(page()-1)" [disabled]="page()===1"
                    class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all disabled:opacity-30"
                    style="border-color:#e8ddd4;color:#7b1c1c;">
              â† Previous
            </button>
            <span class="text-xs" style="color:#a89585;">Page {{ page() }} of {{ totalPages() }}</span>
            <button (click)="changePage(page()+1)" [disabled]="page()===totalPages()"
                    class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all disabled:opacity-30"
                    style="border-color:#e8ddd4;color:#7b1c1c;">
              Next â†’
            </button>
          </div>
        }
      }
    </div>

    <!-- â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="modal-header flex items-center justify-between">
            <div>
              <h3 style="font-family:'Playfair Display',serif;color:#1a0505;font-weight:700;font-size:1.15rem;">
                {{ editId() ? 'Edit Product' : 'Add New Product' }}
              </h3>
              <p class="text-xs mt-0.5" style="color:#a89585;">{{ editId() ? 'Update product details below' : 'Fill in the details to list a new product' }}</p>
            </div>
            <button (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    style="color:#a89585;" onmouseover="this.style.background='#f5ede6'" onmouseout="this.style.background='transparent'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body space-y-5">

            <!-- Image upload â€” full width at top -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:#7b1c1c;letter-spacing:0.14em;">Product Image</label>
              <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelect($event)" />

              @if (imagePreview()) {
                <div class="upload-zone has-image" style="border-radius:10px;">
                  <img [src]="imagePreview()" alt="preview" class="w-full object-cover" style="max-height:200px;display:block;" />
                  <div class="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-all"
                       style="background:linear-gradient(to top,rgba(26,5,5,0.7),rgba(26,5,5,0.2));">
                    <button type="button" (click)="fileInput.click()"
                            class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                            style="background:#c9a84c;color:#fff;">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                      </svg>
                      Replace
                    </button>
                    <button type="button" (click)="removeImage()"
                            class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                            style="background:#7b1c1c;color:#fff;">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              } @else {
                <div class="upload-zone py-8" (click)="fileInput.click()"
                     (dragover)="$event.preventDefault(); dragOver=true" (dragleave)="dragOver=false"
                     (drop)="onDrop($event)" [class.drag-over]="dragOver">
                  @if (uploading()) {
                    <div class="flex flex-col items-center gap-3">
                      <svg class="animate-spin w-8 h-8" style="color:#c9a84c;" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span class="text-sm font-medium" style="color:#a89585;">Uploading imageâ€¦</span>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center gap-2">
                      <div class="w-14 h-14 rounded-full flex items-center justify-center mb-1" style="background:rgba(201,168,76,0.1);">
                        <svg class="w-7 h-7" style="color:#c9a84c;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                        </svg>
                      </div>
                      <p class="text-sm font-semibold" style="color:#5a4040;">Click or drag & drop to upload</p>
                      <p class="text-xs" style="color:#c4a882;">JPG, PNG, WEBP, AVIF Â· max 5 MB</p>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Name <span style="color:#dc2626;">*</span></label>
              <input [(ngModel)]="form.name" class="input" placeholder="e.g. Banjara Embroidered Saree" />
            </div>

            <!-- Short description -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Short Description</label>
              <input [(ngModel)]="form.shortDescription" class="input" placeholder="One-line summary shown in listings" />
            </div>

            <!-- Full description -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Description</label>
              <textarea [(ngModel)]="form.description" class="textarea" rows="3" placeholder="Full product details, materials, care instructionsâ€¦"></textarea>
            </div>

            <!-- Price + Compare price -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Selling Price (â‚¹) <span style="color:#dc2626;">*</span></label>
                <input type="number" [(ngModel)]="form.price" class="input" placeholder="0" min="0" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Compare / MRP (â‚¹)</label>
                <input type="number" [(ngModel)]="form.comparePrice" class="input" placeholder="Strike-through price" min="0" />
              </div>
            </div>

            <!-- Stock + SKU -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Stock Qty</label>
                <input type="number" [(ngModel)]="form.stock" class="input" placeholder="0" min="0" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">SKU</label>
                <input [(ngModel)]="form.sku" class="input" placeholder="BT-001" />
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Category</label>
              <select [(ngModel)]="form.categoryId" class="input" style="cursor:pointer;">
                <option value="">â€” Select category â€”</option>
                @for (cat of categories(); track cat._id) {
                  <option [value]="cat._id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Tags <span style="font-weight:400;text-transform:none;font-size:0.7rem;">(comma-separated)</span></label>
              <input [(ngModel)]="form.tags" class="input" placeholder="embroidery, banjara, handmade, saree" />
            </div>

            <!-- Image alt -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-1.5" style="color:#a89585;letter-spacing:0.13em;">Image Alt Text</label>
              <input [(ngModel)]="form.imageAlt" class="input" placeholder="Describe the image for accessibility" />
            </div>

            <!-- Toggles -->
            <div class="flex gap-6 pt-1">
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <div class="relative w-10 h-5.5" style="height:22px;">
                  <input type="checkbox" [(ngModel)]="form.isFeatured" class="sr-only peer" />
                  <div class="w-10 h-5 rounded-full transition-colors peer-checked:bg-yellow-500 bg-gray-200" style="height:20px;width:40px;border-radius:999px;transition:background 0.2s;"
                       [style.background]="form.isFeatured ? '#c9a84c' : '#e2d5cb'"></div>
                  <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                       style="width:16px;height:16px;top:2px;left:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:transform 0.2s;"
                       [style.transform]="form.isFeatured ? 'translateX(20px)' : 'translateX(0)'"></div>
                </div>
                <span class="text-sm font-medium" style="color:#5a4040;">Featured</span>
              </label>
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <div class="relative" style="height:22px;">
                  <input type="checkbox" [(ngModel)]="form.isActive" class="sr-only peer" />
                  <div style="width:40px;height:20px;border-radius:999px;transition:background 0.2s;"
                       [style.background]="form.isActive ? '#7b1c1c' : '#e2d5cb'"></div>
                  <div style="position:absolute;width:16px;height:16px;top:2px;left:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:transform 0.2s;"
                       [style.transform]="form.isActive ? 'translateX(20px)' : 'translateX(0)'"></div>
                </div>
                <span class="text-sm font-medium" style="color:#5a4040;">Active (Live)</span>
              </label>
            </div>

            @if (error()) {
              <div class="flex items-start gap-2 px-4 py-3 rounded-lg" style="background:#fef2f2;border:1px solid #fecaca;">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" style="color:#dc2626;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
                </svg>
                <p class="text-xs" style="color:#991b1b;">{{ error() }}</p>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="modal-footer flex items-center gap-3">
            <button (click)="saveProduct()" [disabled]="saving() || uploading()" class="btn-gold flex-1 flex items-center justify-center gap-2">
              @if (saving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Savingâ€¦
              } @else if (uploading()) {
                Uploading imageâ€¦
              } @else {
                {{ editId() ? 'Save Changes' : 'Create Product' }}
              }
            </button>
            <button (click)="closeModal()" class="btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminProductsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  products      = signal<Product[]>([]);
  categories    = signal<Category[]>([]);
  loading       = signal(true);
  showModal     = signal(false);
  editId        = signal<string | null>(null);
  saving        = signal(false);
  uploading     = signal(false);
  imagePreview  = signal('');
  error         = signal('');
  total         = signal(0);
  page          = signal(1);
  totalPages    = signal(1);
  searchQ       = '';
  dragOver      = false;
  private searchTimer: any;

  form = blankForm();

  ngOnInit() {
    this.adminSvc.getCategories().subscribe({ next: (r) => this.categories.set(r.data) });
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.adminSvc.getProducts({ page: this.page(), limit: 15, search: this.searchQ }).subscribe({
      next: (r) => {
        this.products.set(r.data);
        this.total.set(r.pagination.total);
        this.totalPages.set(r.pagination.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.loadProducts(); }, 400);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p); this.loadProducts();
  }

  getCatName(p: Product): string {
    if (!p.category) return 'â€”';
    return typeof p.category === 'string' ? p.category : (p.category as Category).name;
  }

  openCreate() {
    this.form = blankForm();
    this.editId.set(null);
    this.error.set('');
    this.imagePreview.set('');
    this.showModal.set(true);
  }

  openEdit(p: Product) {
    const catId = p.category ? (typeof p.category === 'string' ? p.category : (p.category as Category)._id) : '';
    this.form = {
      name: p.name, shortDescription: p.shortDescription, description: p.description,
      price: p.price, comparePrice: p.comparePrice ?? null, stock: p.stock, sku: p.sku ?? '',
      categoryId: catId, tags: (p.tags ?? []).join(', '), isFeatured: p.isFeatured,
      isActive: p.isActive, imageUrl: p.images?.[0]?.url ?? '', imageAlt: p.images?.[0]?.alt ?? '',
    };
    this.imagePreview.set(p.images?.[0]?.url ?? '');
    this.editId.set(p._id); this.error.set(''); this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.imagePreview.set(''); }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.uploadFile(file);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.uploadFile(file);
    input.value = '';
  }

  private uploadFile(file: File) {
    this.uploading.set(true);
    this.error.set('');
    this.adminSvc.uploadImage(file).subscribe({
      next: (res) => {
        this.form.imageUrl = res.url;
        this.imagePreview.set(res.url);
        this.uploading.set(false);
      },
      error: (e: any) => {
        this.uploading.set(false);
        this.error.set(e.error?.message || 'Image upload failed.');
      },
    });
  }

  removeImage() {
    this.form.imageUrl = '';
    this.form.imageAlt = '';
    this.imagePreview.set('');
  }

  saveProduct() {
    if (!this.form.name.trim()) { this.error.set('Product name is required.'); return; }
    if (this.form.price === null || this.form.price === undefined) { this.error.set('Selling price is required.'); return; }
    if (!this.form.categoryId) { this.error.set('Please select a category.'); return; }

    this.saving.set(true); this.error.set('');
    const payload: any = {
      name: this.form.name, shortDescription: this.form.shortDescription,
      description: this.form.description, price: this.form.price,
      comparePrice: this.form.comparePrice || undefined, stock: this.form.stock,
      sku: this.form.sku || undefined, category: this.form.categoryId,
      tags: this.form.tags ? this.form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      isFeatured: this.form.isFeatured, isActive: this.form.isActive,
      images: this.form.imageUrl ? [{ url: this.form.imageUrl, alt: this.form.imageAlt, isPrimary: true }] : [],
    };
    const req$ = this.editId()
      ? this.adminSvc.updateProduct(this.editId()!, payload)
      : this.adminSvc.createProduct(payload);
    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.loadProducts(); },
      error: (e: any) => {
        this.saving.set(false);
        // Show specific Mongoose field errors if available, otherwise generic message
        const fieldErrors: { field: string; message: string }[] = e.error?.errors;
        if (fieldErrors?.length) {
          this.error.set(fieldErrors.map(fe => fe.message).join(' · '));
        } else {
          this.error.set(e.error?.message || 'Save failed. Please try again.');
        }
      },
    });
  }

  confirmDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.adminSvc.deleteProduct(p._id).subscribe({ next: () => this.loadProducts() });
  }
}

