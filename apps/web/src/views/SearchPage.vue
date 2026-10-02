<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  ChevronDown,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-vue-next";
import { categories, products } from "../data/products";
import ProductCard from "../components/ProductCard.vue";
import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";
import StatusView from "../components/StatusView.vue";
import { catalogApi } from "../services/catalog";
import { intelligenceApi } from "../services/intelligence";

const route = useRoute();
const query = ref(String(route.query.q ?? ""));
const selectedCategory = ref("");
const selectedBrands = ref<string[]>([]);
const selectedSellers = ref<string[]>([]);
const sortBy = ref("recommended");
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const minimumRating = ref(0);
const inStockOnly = ref(false);
const discountOnly = ref(false);
const filtersOpen = ref(false);
const visibleCount = ref(24);
const loading = ref(false);
const apiError = ref(false);
const catalog = ref(products);

async function loadCatalog() {
  loading.value = true;
  apiError.value = false;
  try {
    catalog.value = await catalogApi.listProducts();
    if (query.value.trim() && intelligenceApi.enabled) catalog.value = (await intelligenceApi.search(query.value)).data;
  } catch {
    apiError.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(loadCatalog);

watch(
  () => route.query.q,
  async (value) => {
    query.value = String(value ?? "");
    if (!query.value.trim() || !intelligenceApi.enabled) return;
    loading.value = true;
    try { catalog.value = (await intelligenceApi.search(query.value)).data; apiError.value = false; }
    catch { apiError.value = true; }
    finally { loading.value = false; }
  },
);
watch(
  () => route.params.slug,
  () => (selectedCategory.value = ""),
);

const resultProducts = computed(() => {
  const term = query.value.trim().toLowerCase();
  const dealSearch = /\b(deal|deals|sale|sales|offer|offers)\b/.test(term);
  const hotSearch = /\b(hot|selling|trending)\b/.test(term);
  const routeCategory =
    categories.find((category) => category.slug === route.params.slug)?.name ??
    "";
  const filtered = catalog.value.filter((product) => {
    const matchesTerm =
      !term ||
      `${product.name} ${product.brand} ${product.category} ${product.description} ${product.badge ?? ""}`
        .toLowerCase()
        .includes(term);
    const matchesShoppingShortcut =
      (dealSearch && Boolean(product.originalPrice)) ||
      (hotSearch && (product.badge?.toLowerCase().includes("hot selling") ?? false));
    const matchesCategory = !selectedCategory.value
      ? !routeCategory || product.category === routeCategory
      : product.category === selectedCategory.value;
    const matchesPrice =
      (minPrice.value === null || product.price >= minPrice.value) &&
      (maxPrice.value === null || product.price <= maxPrice.value);
    const matchesRating = product.rating >= minimumRating.value;
    const matchesAvailability = !inStockOnly.value || product.stock > 0;
    const matchesBrand =
      selectedBrands.value.length === 0 ||
      selectedBrands.value.includes(product.brand);
    const matchesSeller =
      selectedSellers.value.length === 0 ||
      selectedSellers.value.includes(product.seller);
    const matchesDiscount =
      !discountOnly.value ||
      Boolean(product.originalPrice && product.originalPrice > product.price);
    return (
      (!term || matchesShoppingShortcut || matchesTerm) &&
      matchesCategory &&
      matchesPrice &&
      matchesRating &&
      matchesAvailability &&
      matchesBrand &&
      matchesSeller &&
      matchesDiscount
    );
  });
  return [...filtered].sort((a, b) => {
    if (sortBy.value === "price-low") return a.price - b.price;
    if (sortBy.value === "price-high") return b.price - a.price;
    if (sortBy.value === "rating") return b.rating - a.rating;
    if (sortBy.value === "newest") return b.id.localeCompare(a.id);
    return 0;
  });
});

const visibleProducts = computed(() => resultProducts.value.slice(0, visibleCount.value));
watch(
  [query, selectedCategory, selectedBrands, selectedSellers, sortBy, minPrice, maxPrice, minimumRating, inStockOnly, discountOnly],
  () => { visibleCount.value = 24; },
  { deep: true },
);

function reset() {
  selectedCategory.value = "";
  selectedBrands.value = [];
  selectedSellers.value = [];
  query.value = "";
  minPrice.value = null;
  maxPrice.value = null;
  minimumRating.value = 0;
  inStockOnly.value = false;
  discountOnly.value = false;
}
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container listing-layout">
      <aside class="filter-panel" :class="{ 'filter-open': filtersOpen }">
        <div class="filter-head">
          <div><SlidersHorizontal :size="18" /><b>Filters</b></div>
          <button class="text-button" @click="reset">Clear all</button>
          <button
            class="filter-close"
            aria-label="Close filters"
            @click="filtersOpen = false"
          >
            <X />
          </button>
        </div>
        <div class="filter-group">
          <h3>Category</h3>
          <label
            v-for="category in categories"
            :key="category.id"
            class="check-row"
            ><input
              v-model="selectedCategory"
              type="radio"
              :value="category.name"
              name="category"
            /><span>{{ category.name }}</span></label
          >
        </div>
        <div class="filter-group">
          <h3>Price range</h3>
          <div class="price-inputs">
            <label
              ><span>From (PKR)</span
              ><input
                v-model.number="minPrice"
                type="number"
                min="0"
                placeholder="0"
            /></label>
            <label
              ><span>To (PKR)</span
              ><input
                v-model.number="maxPrice"
                type="number"
                min="0"
                placeholder="Any"
            /></label>
          </div>
        </div>
        <div class="filter-group">
          <h3>Brand</h3>
          <label
            v-for="brand in [
              ...new Set(catalog.map((product) => product.brand)),
            ]"
            :key="brand"
            class="check-row"
            ><input
              v-model="selectedBrands"
              type="checkbox"
              :value="brand"
            /><span>{{ brand }}</span></label
          >
        </div>
        <div class="filter-group">
          <h3>Seller</h3>
          <label
            v-for="seller in [
              ...new Set(catalog.map((product) => product.seller)),
            ]"
            :key="seller"
            class="check-row"
            ><input
              v-model="selectedSellers"
              type="checkbox"
              :value="seller"
            /><span>{{ seller }}</span></label
          >
        </div>
        <div class="filter-group">
          <h3>Customer rating</h3>
          <label class="check-row"
            ><input
              v-model="minimumRating"
              type="radio"
              :value="4.5"
              name="rating"
            /><span class="stars-filter"
              >★★★★★ <small>4.5 & up</small></span
            ></label
          >
          <label class="check-row"
            ><input
              v-model="minimumRating"
              type="radio"
              :value="4"
              name="rating"
            /><span class="stars-filter"
              >★★★★☆ <small>4 & up</small></span
            ></label
          >
        </div>
        <div class="filter-group">
          <h3>Availability</h3>
          <label class="check-row"
            ><input v-model="inStockOnly" type="checkbox" /><span
              >In stock</span
            ></label
          >
        </div>
        <div class="filter-group">
          <h3>Offers</h3>
          <label class="check-row"
            ><input v-model="discountOnly" type="checkbox" /><span
              >On discount</span
            ></label
          >
        </div>
        <button
          class="button button-primary filter-apply"
          @click="filtersOpen = false"
        >
          Show {{ resultProducts.length }} results
        </button>
      </aside>
      <section class="listing-main">
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink><span>/</span
          ><span>{{
            route.params.slug
              ? String(route.params.slug).replaceAll("-", " ")
              : "Search results"
          }}</span>
        </div>
        <div class="listing-title-row">
          <div>
            <span class="eyebrow">DISCOVER SOMETHING GOOD</span>
            <h1>
              {{
                route.params.slug
                  ? String(route.params.slug).replaceAll("-", " ")
                  : query
                    ? `Results for “${query}”`
                    : "Explore the marketplace"
              }}
            </h1>
            <p>
              {{ resultProducts.length }} handpicked results from trusted stores
            </p>
          </div>
          <button
            class="button button-outline mobile-filter-button"
            @click="filtersOpen = true"
          >
            <SlidersHorizontal :size="16" /> Filters
          </button>
        </div>
        <div class="listing-toolbar">
          <label class="inline-search"
            ><Search :size="17" /><input
              v-model="query"
              aria-label="Search results"
              placeholder="Search in results"
          /></label>
          <label class="sort-select"
            >Sort by
            <select v-model="sortBy" aria-label="Sort products">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option></select
            ><ChevronDown :size="15"
          /></label>
        </div>
        <div v-if="loading" class="product-grid">
          <StatusView mode="loading" title="Finding good things" />
        </div>
        <div v-else-if="apiError">
          <StatusView
            mode="error"
            title="Catalog unavailable"
            message="We couldn't reach the marketplace catalog."
            @retry="loadCatalog"
          />
        </div>
        <div
          v-else-if="resultProducts.length"
          class="product-grid listing-products"
        >
          <ProductCard
            v-for="product in visibleProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        <button v-if="visibleCount < resultProducts.length" class="load-more-button" @click="visibleCount = Math.min(visibleCount + 24, resultProducts.length)">
          Load more products <span>({{ resultProducts.length - visibleCount }} left)</span>
        </button>
        <StatusView
          v-else-if="!resultProducts.length"
          mode="empty"
          title="No products found"
          message="Try a different search or clear your filters."
        />
        <div class="catalog-note">
          <ShieldCheck :size="17" /> Every store on BazaarX is reviewed for a
          more confident shopping experience.
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
