<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Clock3, Flame, ShoppingCart, Zap } from "lucide-vue-next";
import type { FlashSale } from "../services/commerce";
import { commerceApi } from "../services/commerce";
import { products } from "../data/products";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";

const router = useRouter();
const shop = useShopStore();
const loading = ref(true);
const error = ref("");
const sales = ref<FlashSale[]>([]);
const now = ref(Date.now());
let timer: number | undefined;
function remaining(endsAt: string) {
  const seconds = Math.max(0, Math.floor((Date.parse(endsAt) - now.value) / 1000));
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor(seconds % 3600 / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${rest}`;
}
function fallbackSales(): FlashSale[] {
  const first = products.find((product) => product.id === "p1")!;
  const second = products.find((product) => product.id === "p2")!;
  const end = new Date(Date.now() + 7 * 86_400_000).toISOString();
  return [{ id: "demo-flash-week", name: "Technology Week Flash Sale", startsAt: new Date().toISOString(), endsAt: end, status: "ACTIVE", items: [
    { productId: first.id, normalPrice: first.price, flashPrice: 174_999, allocatedStock: 8, sold: 2, perUserLimit: 1, product: first },
    { productId: second.id, normalPrice: second.price, flashPrice: 9_999, allocatedStock: 16, sold: 5, perUserLimit: 2, product: second },
  ] }];
}
async function load() {
  loading.value = true; error.value = "";
  try {
    if (!commerceApi.enabled) { sales.value = fallbackSales(); return; }
    const response = await commerceApi.flashSales();
    sales.value = response.data.filter((sale) => sale.status === "ACTIVE");
    if (!sales.value.length) error.value = "There are no active flash sales right now.";
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Flash sales could not be loaded.";
    sales.value = fallbackSales();
  } finally { loading.value = false; }
}
function add(productId: string, saleId: string, price: number) { shop.addToCart(productId, saleId, price); router.push("/cart"); }
onMounted(() => { void load(); timer = window.setInterval(() => now.value = Date.now(), 1000); });
onUnmounted(() => { if (timer) window.clearInterval(timer); });
</script>

<template><div class="page-shell"><SiteHeader /><main class="container content-page"><div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Flash sales</span></div><div class="flash-page-hero"><span class="flash-page-icon"><Flame /></span><div><span class="eyebrow">LIMITED TIME · LIMITED STOCK</span><h1>Flash sales</h1><p>Short-run prices on selected products. The API checks allocated stock again at checkout.</p></div><div v-if="sales.length" class="flash-clock"><Clock3 /><span>Sale ends in <b>{{ remaining(sales[0].endsAt) }}</b></span></div></div><div v-if="loading" class="flash-state" role="status">Loading available flash sales…</div><div v-else-if="!sales.length" class="flash-state"><Zap /><b>No active flash sales</b><p>{{ error || "Check back soon for the next limited-time offer." }}</p><RouterLink to="/search" class="flash-button">Browse all products</RouterLink></div><section v-for="sale in sales" :key="sale.id" class="flash-sale-section"><div class="flash-sale-heading"><div><span class="eyebrow">BAZAARX EVENT</span><h2>{{ sale.name }}</h2></div><span class="flash-clock"><Clock3 /> {{ remaining(sale.endsAt) }}</span></div><p v-if="error" class="flash-fallback-note" role="status">{{ error }} Showing sample offers while the API is unavailable.</p><div class="flash-product-grid"><article v-for="item in sale.items" :key="item.productId" class="flash-product"><img :src="item.product?.image || products.find((product) => product.id === item.productId)?.image" :alt="item.product?.name || 'Flash sale product'" loading="lazy" /><div class="flash-product-copy"><span class="flash-stock">{{ Math.max(0, item.allocatedStock - item.sold) }} left in this offer</span><h3>{{ item.product?.name || 'Featured product' }}</h3><small>Sold by {{ item.product?.seller || 'BazaarX seller' }}</small><div class="flash-prices"><b>PKR {{ item.flashPrice.toLocaleString('en-PK') }}</b><del>PKR {{ item.normalPrice.toLocaleString('en-PK') }}</del></div><button class="flash-button" :disabled="item.allocatedStock <= item.sold" @click="add(item.productId, sale.id, item.flashPrice)"><ShoppingCart /> {{ item.allocatedStock <= item.sold ? 'Offer sold out' : 'Add offer to cart' }}</button></div></article></div></section></main><SiteFooter /></div></template>

<style scoped>
.flash-page-hero,.flash-sale-heading{display:flex;align-items:center;gap:16px;justify-content:space-between}.flash-page-hero{margin:20px 0 24px;padding:22px;background:linear-gradient(110deg,#fff4ed,#fff 60%);border:1px solid #ffe1d3;border-radius:16px}.flash-page-icon{flex:none;width:52px;height:52px;border-radius:15px;background:#f4511e;color:white;display:grid;place-items:center}.flash-page-hero>div:nth-child(2){flex:1}.flash-page-hero h1{font-size:29px;color:#152640;margin:5px 0}.flash-page-hero p{font-size:12px;color:#758297;margin:0}.flash-clock{display:flex;align-items:center;gap:8px;background:white;border:1px solid #e8edf3;border-radius:9px;padding:10px 12px;color:#6c7a8d;font-size:11px;white-space:nowrap}.flash-clock svg{width:16px;color:#f4511e}.flash-clock b{color:#f4511e;font-variant-numeric:tabular-nums}.flash-sale-section{margin:26px 0}.flash-sale-heading h2{font-size:20px;color:#1b2b42;margin:5px 0}.flash-fallback-note{background:#fff8e8;color:#846a2d;border-radius:8px;padding:9px;font-size:11px}.flash-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.flash-product{background:white;border:1px solid #e8edf3;border-radius:13px;overflow:hidden;box-shadow:0 8px 20px #1f38500a}.flash-product img{width:100%;height:205px;object-fit:contain;background:#f7f8fa;padding:14px}.flash-product-copy{padding:14px}.flash-stock{color:#f4511e;font-size:10px;font-weight:800}.flash-product h3{font-size:14px;color:#1b2b42;margin:7px 0 4px}.flash-product small{color:#7b8797}.flash-prices{display:flex;align-items:center;gap:9px;margin:12px 0}.flash-prices b{color:#e94720}.flash-prices del{color:#9aa3af;font-size:11px}.flash-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:8px;background:#f4511e;color:white;padding:10px 13px;text-decoration:none;font-size:12px;font-weight:700;cursor:pointer}.flash-button:disabled{background:#adb6c2;cursor:not-allowed}.flash-button svg{width:15px}.flash-state{min-height:210px;display:grid;place-content:center;justify-items:center;gap:10px;border:1px solid #e8edf3;border-radius:13px;background:white;color:#738198;text-align:center}.flash-state>svg{color:#f4511e}.flash-state b{color:#1b2b42}.flash-state p{margin:0;font-size:12px}@media(max-width:760px){.flash-page-hero{align-items:flex-start;flex-wrap:wrap}.flash-clock{margin-left:67px}.flash-product-grid{grid-template-columns:repeat(2,1fr)}.flash-product img{height:160px}}@media(max-width:480px){.flash-product-grid{grid-template-columns:1fr}.flash-product{display:grid;grid-template-columns:115px 1fr}.flash-product img{height:100%;min-height:190px;padding:8px}.flash-product-copy{padding:11px}.flash-page-hero h1{font-size:25px}}
</style>
