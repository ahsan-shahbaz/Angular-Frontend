import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.model';

export const loadProducts = createAction('[Product List] Load Products');

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
