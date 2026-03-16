export interface ProductFilters {
  priceMin: number | null;
  priceMax: number | null;
  category: string | null;
  brand: string | null;
  rating: number | null;
  inStockOnly: boolean;
  sortBy: string | null;
}
