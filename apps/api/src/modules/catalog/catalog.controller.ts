import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { categories, products } from "@bazaarx/catalog";

// Buyer pages and API endpoints use the same sample product list.
export const catalog = products;

@Controller("catalog")
export class CatalogController {
  @Get("products")
  listProducts() {
    return { data: catalog, total: catalog.length };
  }

  @Get("products/:slug")
  getProduct(@Param("slug") slug: string) {
    const product = catalog.find((item) => item.slug === slug);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  @Get("categories")
  listCategories() {
    return { data: categories.map((category) => category.name) };
  }
}
