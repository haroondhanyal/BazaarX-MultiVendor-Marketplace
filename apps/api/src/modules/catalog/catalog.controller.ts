import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

// Catalog seed data keeps the first frontend phase usable before database seeding is introduced.
export const catalog = [
  {
    id: "p1",
    slug: "nova-x-pro",
    name: "Nova X Pro 5G Smartphone",
    category: "Mobiles",
    brand: "Nova",
    description:
      "A vivid AMOLED display, all-day battery and a pro-grade camera system in a refined, lightweight design.",
    price: 189999,
    originalPrice: 219999,
    rating: 4.8,
    reviews: 1284,
    seller: "TechStore Official",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85",
    badge: "Best seller",
    colors: ["Graphite", "Silver"],
    specifications: {
      Display: "6.7-inch AMOLED",
      Storage: "256 GB",
      Battery: "5,000 mAh",
      Warranty: "1 year official warranty",
    },
  },
  {
    id: "p2",
    slug: "studio-wireless-headphones",
    name: "Studio Wireless Headphones",
    category: "Electronics",
    brand: "SoundMax",
    description:
      "Comfortable over-ear headphones with clear sound, active noise cancellation and up to 40 hours of listening.",
    price: 12499,
    originalPrice: 16999,
    rating: 4.6,
    reviews: 842,
    seller: "AudioHub",
    stock: 42,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    badge: "28% off",
    colors: ["Black", "Cream"],
    specifications: {
      Connectivity: "Bluetooth 5.3",
      Battery: "Up to 40 hours",
      Warranty: "6 months",
    },
  },
  {
    id: "p3",
    slug: "pulse-smart-watch",
    name: "Pulse Smart Watch Series 4",
    category: "Electronics",
    brand: "Pulse",
    description:
      "Track your day with a bright touch display, health insights and a comfortable water-resistant design.",
    price: 8999,
    originalPrice: 11999,
    rating: 4.5,
    reviews: 526,
    seller: "Gadget Galaxy",
    stock: 26,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    badge: "Popular",
    colors: ["Black", "Rose Gold"],
    specifications: {
      Display: "1.8-inch touch",
      Battery: "7 days",
      "Water resistance": "IP68",
    },
  },
];

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
    return {
      data: [
        "Mobiles",
        "Electronics",
        "Home & Living",
        "Fashion",
        "Beauty",
        "Sports",
        "Appliances",
        "Computing",
      ],
    };
  }
}
