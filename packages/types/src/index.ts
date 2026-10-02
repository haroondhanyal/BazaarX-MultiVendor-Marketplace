export type UserRole = "customer" | "seller" | "admin";
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  seller: string;
  stock: number;
  image: string;
  badge?: string;
  colors?: string[];
  specifications?: Record<string, string>;
}
export interface CartLine {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "PLACED"
  | "SELLER_PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface MarketplaceOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: string;
  address: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  voucherDiscount?: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    seller: string;
  }>;
}
