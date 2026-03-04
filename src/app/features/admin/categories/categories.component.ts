import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../core/models/product.model';

interface CatForm {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string;
  imageAlt: string;
}

const blankForm = (): CatForm => ({ name: '', description: '', sortOrder: 0, isActive: true, imageUrl: '', imageAlt: '' });

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .input { background:transparent; border:none; border-bottom:1.5px solid #d4c5b5; padding:8px 0; font-size:0.875rem;
             color:#1a1a1a; width:100%; outline:none; transition:border-color 0.2s; }
    .input:focus { border-bottom-color:#c9a84c; }
    .btn-primary { background:linear-gradient(135deg,#7b1c1c,#5a1010); color:#fff; font-size:0.75rem; font-weight:600;
                   letter-spacing:0.08em; padding:10px 22px; border-radius:3px; transition:transform 0.15s,box-shadow 0.2s; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(123,28,28,0.28); }
    .btn-primary:disabled { opacity:0.5; transform:none; }
    .overlay { position:fixed; inset:0; background:rgba(26,5,5,0.55); backdrop-filter:blur(4px); z-index:50; display:flex; align-items:center; justify-content:center; }
    .modal { background:#fff; border-radius:6px; padding:28px; width:100%; max-width:460px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
  `],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl mb-1" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">Categories</h2>
          <p class="text-sm" style="color:#a89585; font-weight:300;">{{ categories().length }} category(ies)</p>
        </div>
        <button (click)="openCreate()" class="btn-primary">+ New Category</button>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-14 rounded animate-pulse" style="background:#e8ddd4;"></div>
          }
        </div>
      } @else if (categories().length === 0) {
        <div class="text-center py-14" style="color:#a89585;">No categories yet.</div>
      } @else {
        <div class="bg-white rounded-lg border overflow-hidden" style="border-color:#f0e8df;">
          <table class="w-full text-sm">
            <thead>
              <tr style="background:#faf6f0; border-bottom:1px solid #f0e8df;">
                <th class="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider" style="color:#a89585; letter-spacing:0.12em;">Name</th>
                <th class="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider hidden sm:table-cell" style="color:#a89585; letter-spacing:0.12em;">Slug</th>
                <th class="text-center px-5 py-3 font-medium text-xs uppercase tracking-wider" style="color:#a89585; letter-spacing:0.12em;">Status</th>
                <th class="text-center px-5 py-3 font-medium text-xs uppercase tracking-wider" style="color:#a89585; letter-spacing:0.12em;">Order</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat._id) {
                <tr class="border-t" style="border-color:#f0e8df;">
                  <td class="px-5 py-3.5 font-medium" style="color:#1a0505;">{{ cat.name }}</td>
                  <td class="px-5 py-3.5 hidden sm:table-cell text-xs" style="color:#a89585;">{{ cat.slug }}</td>
                  <td class="px-5 py-3.5 text-center">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                          [style]="cat.isActive ? 'background:#f0fdf4;color:#16a34a;' : 'background:#fef2f2;color:#dc2626;'">
                      {{ cat.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-center text-xs" style="color:#a89585;">{{ cat.sortOrder }}</td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <button (click)="openEdit(cat)" class="text-xs font-medium" style="color:#7b1c1c;">Edit</button>
                      <button (click)="confirmDelete(cat)" class="text-xs" style="color:#d4c5b5;">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold mb-5" style="font-family:'Playfair Display',serif; color:#1a0505;">
            {{ editId() ? 'Edit Category' : 'New Category' }}
          </h3>

          <div class="space-y-5">
            <div>
              <label class="block text-xs uppercase tracking-widest mb-1.5" style="color:#a89585; letter-spacing:0.15em;">Name *</label>
              <input [(ngModel)]="form.name" class="input" placeholder="e.g. Sarees" />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-widest mb-1.5" style="color:#a89585; letter-spacing:0.15em;">Description</label>
              <input [(ngModel)]="form.description" class="input" placeholder="Short description" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs uppercase tracking-widest mb-1.5" style="color:#a89585; letter-spacing:0.15em;">Sort Order</label>
                <input type="number" [(ngModel)]="form.sortOrder" class="input" placeholder="0" />
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.isActive" class="w-4 h-4 accent-[#7b1c1c]" />
                  <span class="text-sm" style="color:#5a4040;">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-xs uppercase tracking-widest mb-1.5" style="color:#a89585; letter-spacing:0.15em;">Image URL</label>
              <input [(ngModel)]="form.imageUrl" class="input" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-widest mb-1.5" style="color:#a89585; letter-spacing:0.15em;">Image Alt Text</label>
              <input [(ngModel)]="form.imageAlt" class="input" placeholder="Category image description" />
            </div>
          </div>

          @if (error()) {
            <p class="mt-4 text-xs px-3 py-2" style="background:#fef2f2;color:#991b1b;border-radius:2px;">{{ error() }}</p>
          }

          <div class="flex gap-3 mt-6">
            <button (click)="saveCategory()" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Saving…' : (editId() ? 'Update' : 'Create') }}
            </button>
            <button (click)="closeModal()" class="flex-1 text-sm py-2.5" style="border:1px solid #d4c5b5;border-radius:3px;color:#5a4040;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private adminSvc = inject(AdminService);

  categories = signal<Category[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  editId     = signal<string | null>(null);
  saving     = signal(false);
  error      = signal('');
  form       = blankForm();

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminSvc.getCategories().subscribe({
      next: (r) => { this.categories.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.form = blankForm(); this.editId.set(null); this.error.set(''); this.showModal.set(true); }

  openEdit(cat: Category) {
    this.form = { name: cat.name, description: cat.description, sortOrder: cat.sortOrder,
                  isActive: cat.isActive, imageUrl: cat.image?.url ?? '', imageAlt: cat.image?.alt ?? '' };
    this.editId.set(cat._id); this.error.set(''); this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  saveCategory() {
    if (!this.form.name.trim()) { this.error.set('Name is required.'); return; }
    this.saving.set(true); this.error.set('');
    const payload = { name: this.form.name, description: this.form.description,
      sortOrder: this.form.sortOrder, isActive: this.form.isActive,
      image: { url: this.form.imageUrl, alt: this.form.imageAlt } };
    const req$ = this.editId()
      ? this.adminSvc.updateCategory(this.editId()!, payload)
      : this.adminSvc.createCategory(payload);
    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (e: any) => { this.saving.set(false); this.error.set(e.error?.message || 'Save failed.'); },
    });
  }

  confirmDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    this.adminSvc.deleteCategory(cat._id).subscribe({ next: () => this.load() });
  }
}
