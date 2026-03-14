import { createReducer, on } from '@ngrx/store';
import { Product } from '../models/product.model';
import * as ProductActions from './product.actions';

export interface ProductState {
  products: Product[];
  selectedProductId: number | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ProductState = {
  products: [],
  selectedProductId: null,
  loading: false,
  error: null
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
    error: null
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProductActions.selectProduct, (state, { id }) => ({
    ...state,
    selectedProductId: id
  }))
);
