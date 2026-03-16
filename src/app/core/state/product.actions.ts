import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.model';
import { ProductFilters } from '../models/product-filters.model';

export const loadProducts = createAction('[Product List] Load Products');

export const updateFilters = createAction(
  '[Product Filters] Update',
  props<{ filters: Partial<ProductFilters> }>()
);

export const resetFilters = createAction('[Product Filters] Reset');

export const loadProductsSuccess = createAction(
  '[Product List] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Product List] Load Products Failure',
  props<{ error: string }>()
);

export const selectProduct = createAction(
  '[Product List] Select Product',
  props<{ id: number }>()
);

export const searchProducts = createAction(
  '[Product Search] Search Products',
  props<{ query: string }>()
);
