import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalUsers: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  authProvider: 'local' | 'google';
  avatar?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getStats(): Observable<{ success: boolean; data: AdminStats }> {
    return this.http.get<any>(`${this.base}/admin/stats`);
  }

  // Products (all — including inactive)
  getProducts(query: Record<string, any> = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any>(`${this.base}/admin/products`, { params });
  }

  createProduct(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/products`, data);
  }

  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/products/${id}`);
  }

  // Categories (all — including inactive)
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.base}/admin/categories`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/categories/${id}`);
  }

  // Image upload
  uploadImage(file: File): Observable<{ success: boolean; url: string }> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<any>(`${this.base}/upload`, fd);
  }

  // Users
  getUsers(page = 1): Observable<any> {
    return this.http.get<any>(`${this.base}/admin/users?page=${page}`);
  }

  updateUserRole(id: string, role: 'user' | 'admin'): Observable<any> {
    return this.http.patch<any>(`${this.base}/admin/users/${id}/role`, { role });
  }
}
