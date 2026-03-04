import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-xl mb-1" style="font-family:'Playfair Display',serif; color:#1a0505; font-weight:600;">Users</h2>
        <p class="text-sm" style="color:#a89585; font-weight:300;">{{ total() }} registered user(s)</p>
      </div>

      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-14 rounded animate-pulse" style="background:#e8ddd4;"></div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-lg border overflow-x-auto" style="border-color:#f0e8df;">
          <table class="w-full text-sm min-w-[520px]">
            <thead>
              <tr style="background:#faf6f0; border-bottom:1px solid #f0e8df;">
                <th class="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider" style="color:#a89585;">User</th>
                <th class="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell" style="color:#a89585;">Provider</th>
                <th class="text-center px-5 py-3 font-medium text-xs uppercase tracking-wider" style="color:#a89585;">Role</th>
                <th class="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider hidden lg:table-cell" style="color:#a89585;">Joined</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (u of users(); track u._id) {
                <tr class="border-t" style="border-color:#f0e8df;">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                           style="background:linear-gradient(135deg,#c9a84c,#b8943a); color:#2a0808;">
                        {{ u.name[0].toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-medium leading-snug" style="color:#1a0505;">{{ u.name }}</p>
                        <p class="text-xs" style="color:#a89585;">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 hidden md:table-cell">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                          [style]="u.authProvider === 'google' ? 'background:#eff6ff;color:#2563eb;' : 'background:#f5f5f5;color:#525252;'">
                      {{ u.authProvider }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                          [style]="u.role === 'admin' ? 'background:rgba(123,28,28,0.08);color:#7b1c1c;' : 'background:#f5f5f5;color:#737373;'">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 hidden lg:table-cell text-xs" style="color:#a89585;">{{ u.createdAt | date:'mediumDate' }}</td>
                  <td class="px-5 py-3.5 text-right">
                    @if (toggling() === u._id) {
                      <span class="text-xs" style="color:#a89585;">Saving…</span>
                    } @else {
                      <button (click)="toggleRole(u)"
                        class="text-xs font-medium"
                        [style]="u.role === 'admin' ? 'color:#a89585;' : 'color:#7b1c1c;'">
                        {{ u.role === 'admin' ? 'Remove Admin' : 'Make Admin' }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between mt-4 text-sm" style="color:#a89585;">
            <button (click)="changePage(page() - 1)" [disabled]="page() === 1"
                    class="px-4 py-2 rounded border text-xs disabled:opacity-40" style="border-color:#d4c5b5;">← Prev</button>
            <span class="text-xs">Page {{ page() }} of {{ totalPages() }}</span>
            <button (click)="changePage(page() + 1)" [disabled]="page() === totalPages()"
                    class="px-4 py-2 rounded border text-xs disabled:opacity-40" style="border-color:#d4c5b5;">Next →</button>
          </div>
        }
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminSvc = inject(AdminService);

  users      = signal<AdminUser[]>([]);
  loading    = signal(true);
  toggling   = signal<string | null>(null);
  total      = signal(0);
  page       = signal(1);
  totalPages = signal(1);

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.adminSvc.getUsers(this.page()).subscribe({
      next: (r) => {
        this.users.set(r.data);
        this.total.set(r.pagination.total);
        this.totalPages.set(r.pagination.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p); this.loadUsers();
  }

  toggleRole(u: AdminUser) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${u.name}'s role to "${newRole}"?`)) return;
    this.toggling.set(u._id);
    this.adminSvc.updateUserRole(u._id, newRole).subscribe({
      next: (r) => {
        this.toggling.set(null);
        this.users.update(list => list.map(x => x._id === u._id ? r.data : x));
      },
      error: () => this.toggling.set(null),
    });
  }
}
