// ── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: { url: string; alt: string };
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Product image ─────────────────────────────────────────────────────────────
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: ProductImage[];
  category: Category | string;
  tags: string[];
  sku: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  inStock: boolean;
  ratings: { average: number; count: number };
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// ── Products list response ────────────────────────────────────────────────────
export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

// ── Single product response ───────────────────────────────────────────────────
export interface ProductResponse {
  success: boolean;
  data: Product;
}

// ── Categories list response ──────────────────────────────────────────────────
export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}
