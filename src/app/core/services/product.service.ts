import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ProductsResponse,
  ProductResponse,
  CategoriesResponse,
} from '../models/product.model';

export interface ProductQuery {
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;
  private catBase = `${environment.apiUrl}/categories`;

  // ── Products ──────────────────────────────────────────────────────────────
  getProducts(query: ProductQuery = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (query.category)  params = params.set('category',  query.category);
    if (query.featured)  params = params.set('featured',  'true');
    if (query.search)    params = params.set('search',    query.search);
    if (query.sort)      params = params.set('sort',      query.sort);
    if (query.page)      params = params.set('page',      String(query.page));
    if (query.limit)     params = params.set('limit',     String(query.limit));
    if (query.minPrice != null) params = params.set('minPrice', String(query.minPrice));
    if (query.maxPrice != null) params = params.set('maxPrice', String(query.maxPrice));

    return this.http.get<ProductsResponse>(this.base, { params });
  }

  getProductBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.base}/${slug}`);
  }

  getFeatured(limit = 6): Observable<ProductsResponse> {
    return this.getProducts({ featured: true, limit });
  }

  // ── Categories ────────────────────────────────────────────────────────────
  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(this.catBase);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  addReview(slug: string, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.base}/${slug}/reviews`, { rating, comment });
  }
}
