import type { Product } from "@bazaarx/types";
import { products } from "../data/products";

const apiBase = import.meta.env.VITE_API_URL as string | undefined;

// The API adapter uses the local seed catalog unless a backend URL is configured.
export const catalogApi = {
  async listProducts(): Promise<Product[]> {
    if (!apiBase) return products;
    const response = await fetch(`${apiBase}/catalog/products`);
    if (!response.ok) throw new Error("Catalog could not be loaded");
    const payload = (await response.json()) as { data: Product[] };
    return payload.data;
  },

  async getProduct(slug: string): Promise<Product | undefined> {
    if (!apiBase) return products.find((product) => product.slug === slug);
    const response = await fetch(
      `${apiBase}/catalog/products/${encodeURIComponent(slug)}`,
    );
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error("Product could not be loaded");
    return (await response.json()) as Product;
  },
};
