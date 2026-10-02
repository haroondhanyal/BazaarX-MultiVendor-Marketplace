<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Clock3, Flame, Gift, PackageCheck, Truck } from "lucide-vue-next";
import type { Product } from "@bazaarx/types";
import { products } from "../data/products";
import { commerceApi } from "../services/commerce";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ProductCard from "../components/ProductCard.vue";
import { getBrandFallbackLogo, getBrandLogo } from "../data/brandLogos";

const route = useRoute();
const router = useRouter();
const shop = useShopStore();
const selectedBundle = ref<string[]>([]);
const flashProductIds = ref<string[]>([]);
const loading = ref(true);
const now = ref(Date.now());
const saleEndsAt = Date.now() + 8 * 60 * 60 * 1000;
let clockTimer: number | undefined;
const pageType = computed(() => route.meta.collection as "deals" | "newest" | "brands");
watch(() => [route.path, route.query.brand], () => { visibleCount.value = 24; selectedBundle.value = []; });
const arrivalDates = computed(() => {
  const date = (days: number) => new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(new Date(now.value + days * 86_400_000));
  return `${date(2)} – ${date(4)}`;
});
const saleCountdown = computed(() => {
  const total = Math.max(0, Math.floor((saleEndsAt - now.value) / 1000));
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
});
const dealProducts = computed(() => products
  .filter((item) => item.originalPrice && item.originalPrice > item.price && !flashProductIds.value.includes(item.id))
  .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!)));
const newProducts = computed(() => [...products].sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1))));
const brandNames = computed(() => [...new Set(products.map((item) => item.brand))].sort((a, b) => a.localeCompare(b)));
const brandSearch = ref("");
const selectedBrandCategory = ref("All categories");
const brandCategories = computed(() => ["All categories", ...new Set(products.map((item) => item.category).sort((a, b) => a.localeCompare(b)))]);
const visibleBrandNames = computed(() => brandNames.value.filter((brand) => {
  const matchesName = brand.toLowerCase().includes(brandSearch.value.trim().toLowerCase());
  const matchesCategory = selectedBrandCategory.value === "All categories" || products.some((item) => item.brand === brand && item.category === selectedBrandCategory.value);
  return matchesName && matchesCategory;
}));
const failedBrandLogos = ref<string[]>([]);
const brandProducts = computed(() => products.filter((item) => item.brand === route.query.brand));
const pageProducts = computed(() => pageType.value === "deals" ? dealProducts.value : pageType.value === "newest" ? newProducts.value : brandProducts.value);
const title = computed(() => pageType.value === "deals" ? "Today’s Deals" : pageType.value === "newest" ? "New Arrivals" : "Shop Top Brands");
const subtitle = computed(() => pageType.value === "deals"
  ? "Fresh price drops, a 3-for-2 bundle and clear delivery estimates."
  : pageType.value === "newest"
    ? "The latest additions to the BazaarX catalogue, with the newest listings first."
    : route.query.brand
      ? `Shop ${String(route.query.brand)} products from the BazaarX catalogue.`
    : `Explore ${brandNames.value.length}+ brands across fashion, phones, electronics, home, appliances, beauty and more.`);
const visibleCount = ref(24);
const visibleProducts = computed(() => pageProducts.value.slice(0, visibleCount.value));
function toggleBundle(id: string) {
  if (selectedBundle.value.includes(id)) selectedBundle.value = selectedBundle.value.filter((item) => item !== id);
  else if (selectedBundle.value.length < 3) selectedBundle.value = [...selectedBundle.value, id];
}
function addBundle() {
  if (selectedBundle.value.length !== 3) return;
  shop.addDealBundle(selectedBundle.value);
  router.push("/cart");
}
function discount(product: Product) {
  return product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
}
onMounted(async () => {
  try {
    const sales = await commerceApi.flashSales();
    flashProductIds.value = sales.data.filter((sale) => sale.status === "ACTIVE").flatMap((sale) => sale.items.map((item) => item.productId));
  } catch {
    // Keep the local demo flash-sale products separate from today's offers.
    flashProductIds.value = products.filter((item) => item.originalPrice).slice(0, 24).map((item) => item.id);
  } finally { loading.value = false; }
  clockTimer = window.setInterval(() => now.value = Date.now(), 1000);
});
onUnmounted(() => { if (clockTimer) window.clearInterval(clockTimer); });
</script>

<template>
  <div class="page-shell collection-page">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>{{ title }}</span></div>

      <section class="collection-hero" :class="`collection-${pageType}`">
        <span class="collection-icon"><Gift v-if="pageType === 'deals'" /><PackageCheck v-else-if="pageType === 'newest'" /><Flame v-else /></span>
        <div class="collection-copy"><span class="eyebrow">{{ pageType === 'deals' ? 'LIMITED-TIME SAVINGS' : pageType === 'newest' ? 'JUST ADDED' : 'BRANDS ACROSS EVERY CATEGORY' }}</span><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
        <div v-if="pageType === 'deals'" class="collection-clock"><Clock3 /><span>Today’s deals end in <b>{{ saleCountdown }}</b></span></div>
      </section>

      <section v-if="pageType === 'deals'" class="deal-benefits">
        <article><Gift /><div><b>3 for 2 bundle</b><span>Pick any three marked deals. The lowest priced one is free.</span></div></article>
        <article><Truck /><div><b>Free standard shipping</b><span>On orders of PKR 25,000 or more.</span></div></article>
        <article><PackageCheck /><div><b>Estimated arrival</b><span>{{ arrivalDates }} · standard delivery (2–4 days)</span></div></article>
      </section>

      <template v-if="pageType === 'brands' && !route.query.brand">
        <div class="brand-directory-tools">
          <label class="brand-search"><span>Find a brand</span><input v-model="brandSearch" type="search" placeholder="Search 100+ brands" /></label>
          <span>{{ visibleBrandNames.length }} of {{ brandNames.length }} brands</span>
        </div>
        <nav class="brand-category-filters" aria-label="Filter brands by category">
          <button v-for="category in brandCategories" :key="category" type="button" :class="{ active: selectedBrandCategory === category }" @click="selectedBrandCategory = category">{{ category }}</button>
        </nav>
        <section class="brand-directory">
          <RouterLink v-for="brand in visibleBrandNames" :key="brand" :to="{ path: '/brands', query: { brand } }" class="brand-tile">
            <span class="brand-logo-frame" :class="{ 'brand-logo-dark': brand === 'Sveston' }"><img :src="failedBrandLogos.includes(brand) ? getBrandFallbackLogo(brand) : getBrandLogo(brand)" :alt="`${brand} logo`" loading="lazy" @error="failedBrandLogos.includes(brand) || failedBrandLogos.push(brand)" /></span><b>{{ brand }}</b><small>{{ products.filter((item) => item.brand === brand).length }} products</small>
          </RouterLink>
        </section>
        <div v-if="!visibleBrandNames.length" class="collection-empty">No brands match this search.</div>
      </template>
      <div v-else-if="pageType === 'brands'" class="brand-back-row"><RouterLink to="/brands" class="text-link">← All brands</RouterLink><b>{{ brandProducts.length }} products</b></div>

      <div v-if="pageType === 'deals'" class="bundle-bar">
        <div><b>Build your 3-for-2 bundle</b><span>Select 3 Today’s Deals items ({{ selectedBundle.length }}/3 selected).</span></div>
        <button class="button button-primary" :disabled="selectedBundle.length !== 3" @click="addBundle">Add bundle to cart</button>
      </div>
      <div v-if="loading && pageType === 'deals'" class="collection-loading">Loading today’s offers…</div>
      <div v-else-if="pageType === 'brands' && route.query.brand && !brandProducts.length" class="collection-empty">No products are listed for this brand yet.</div>
      <section v-else class="collection-products">
          <div v-for="product in visibleProducts" :key="product.id" class="collection-product-wrap">
          <input v-if="pageType === 'deals'" type="checkbox" :checked="selectedBundle.includes(product.id)" :disabled="selectedBundle.length >= 3 && !selectedBundle.includes(product.id)" :aria-label="`Add ${product.name} to 3 for 2 bundle`" @change="toggleBundle(product.id)" />
          <span v-if="pageType === 'deals'" class="deal-discount-tag">{{ discount(product) }}% OFF</span>
          <ProductCard :product="product" />
        </div>
      </section>
      <button v-if="visibleCount < pageProducts.length" class="load-more-button" @click="visibleCount = Math.min(visibleCount + 24, pageProducts.length)">Load more {{ pageType === 'newest' ? 'new arrivals' : pageType === 'brands' ? 'brand products' : 'deals' }} ({{ pageProducts.length - visibleCount }} left)</button>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.collection-hero{display:flex;align-items:center;gap:16px;margin:20px 0 18px;padding:23px;border:1px solid #f0d7c9;border-radius:16px;background:linear-gradient(110deg,#fff1e9,#fff 72%)}.collection-newest{background:linear-gradient(110deg,#edf5ff,#fff 72%);border-color:#d7e7fa}.collection-brands{background:linear-gradient(110deg,#f5f0ff,#fff 72%);border-color:#e8ddfa}.collection-icon{width:52px;height:52px;flex:none;display:grid;place-items:center;border-radius:15px;color:white;background:#ef5426}.collection-newest .collection-icon{background:#3479c9}.collection-brands .collection-icon{background:#7353ad}.collection-icon :deep(svg){width:23px}.collection-copy{flex:1}.collection-copy h1{font-size:28px;color:#17283e;margin:5px 0}.collection-copy p{font-size:12px;color:#718096;margin:0}.collection-clock{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid #eadfd7;border-radius:9px;background:#fff;color:#64748b;font-size:11px;white-space:nowrap}.collection-clock :deep(svg){width:16px;color:#e94d25}.collection-clock b{color:#d84420;font-variant-numeric:tabular-nums}.deal-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 20px}.deal-benefits article{display:flex;align-items:center;gap:11px;padding:14px;border:1px solid #e9edf2;border-radius:11px;background:var(--surface,#fff)}.deal-benefits article>svg{width:22px;flex:none;color:#e94d25}.deal-benefits article div{display:grid;gap:4px}.deal-benefits b{font-size:12px;color:#25364b}.deal-benefits span{font-size:10px;color:#718096;line-height:1.45}.bundle-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;margin:10px 0 18px;border-radius:11px;background:#fff4ed;border:1px solid #ffd6c4}.bundle-bar>div{display:grid;gap:4px}.bundle-bar b{font-size:13px;color:#39291f}.bundle-bar span{font-size:11px;color:#76685e}.bundle-bar button:disabled{opacity:.5;cursor:not-allowed}.collection-products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.collection-product-wrap{position:relative;min-width:0}.collection-product-wrap>input{position:absolute;z-index:2;top:12px;left:12px;width:20px;height:20px;accent-color:#ed5427;cursor:pointer}.deal-discount-tag{position:absolute;z-index:1;right:10px;top:10px;border-radius:5px;padding:5px 7px;background:#e94d25;color:#fff;font-size:10px;font-weight:800}.brand-directory{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:10px 0 20px}.brand-tile{display:grid;justify-items:center;gap:7px;padding:16px 10px;border:1px solid #e7eaf0;border-radius:12px;background:var(--surface,#fff);color:inherit;text-decoration:none;transition:transform .16s,border-color .16s}.brand-tile:hover{transform:translateY(-2px);border-color:#ef7a4c}.brand-logo-frame{width:100%;height:58px;display:grid;place-items:center;border-radius:9px;background:#f6f7f9;padding:8px}.brand-logo-frame img{display:block;max-width:100%;max-height:100%;object-fit:contain}.brand-logo-dark{background:#151515}.brand-logo-fallback{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#f3f0fa;color:#6749a0;font-size:14px;font-weight:900}.brand-wordmark-fallback{width:auto;height:auto;padding:8px 4px;border:0;border-radius:0;background:none;color:#17283e;font-size:13px;letter-spacing:2px;font-weight:900}.brand-tile b{font-size:12px;text-align:center}.brand-tile small{color:#718096;font-size:10px}.brand-back-row{display:flex;align-items:center;justify-content:space-between;margin:18px 0;color:#66758a;font-size:12px}.collection-loading,.collection-empty{padding:44px 16px;text-align:center;color:#718096}@media(max-width:980px){.collection-products{grid-template-columns:repeat(3,minmax(0,1fr))}.brand-directory{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:700px){.collection-hero{align-items:flex-start;flex-wrap:wrap}.collection-clock{margin-left:68px}.deal-benefits{grid-template-columns:1fr}.collection-products{grid-template-columns:repeat(2,minmax(0,1fr))}.brand-directory{grid-template-columns:repeat(3,minmax(0,1fr))}.collection-copy h1{font-size:24px}}
@media(max-width:470px){.collection-products{grid-template-columns:1fr}.brand-directory{grid-template-columns:repeat(2,minmax(0,1fr))}.bundle-bar{align-items:stretch;flex-direction:column}.collection-clock{margin-left:0}.collection-page :deep(.product-card){display:grid;grid-template-columns:130px minmax(0,1fr)}.collection-page :deep(.product-image-wrap){height:190px;min-height:0}.collection-page :deep(.product-info){padding:11px}}
.brand-directory-tools{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:16px 0 12px;color:#718096;font-size:11px}.brand-search{display:grid;gap:5px;width:min(360px,100%);color:#53657b;font-weight:700}.brand-search input{width:100%;height:40px;padding:0 12px;border:1px solid #e0e6ee;border-radius:8px;background:var(--surface,#fff);color:var(--text,#25364b);font-size:12px}.brand-category-filters{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px}.brand-category-filters button{padding:7px 11px;border:1px solid #e0e6ee;border-radius:20px;background:var(--surface,#fff);color:#596a80;font-size:10px;cursor:pointer}.brand-category-filters button.active{border-color:#ee6a3c;background:#fff1e9;color:#c84620;font-weight:800}.brand-tile>.brand-logo-frame{width:100%;height:58px}.brand-logo-frame .brand-logo-fallback{width:100%;height:100%;display:grid;place-items:center;padding:4px;border-radius:5px;background:transparent;color:#26364b;text-align:center;text-transform:uppercase;font-size:clamp(8px,1vw,13px);font-weight:900;letter-spacing:.4px;line-height:1.1;overflow-wrap:anywhere}.brand-directory .brand-tile{min-width:0}.brand-directory .brand-tile>b{max-width:100%;overflow-wrap:anywhere}
</style>
