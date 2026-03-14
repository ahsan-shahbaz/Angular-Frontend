export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  description: string;
  category: string;
  brand: string;
  image: string;
  images: string[];
  features: string[];
  stock: number;
  rating: {
    rate: number;
    count: number;
  };
  tags: string[];
  variants?: string[];
  selectedVariant?: string;
}
