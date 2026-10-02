<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Bot, Search, Sparkles, Send, ShoppingCart } from "lucide-vue-next";
import { intelligenceApi, type AssistantResult } from "../services/intelligence";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ProductCard from "../components/ProductCard.vue";
import { products } from "../data/products";

const query = ref(""); const loading = ref(false); const error = ref("");
const result = ref<AssistantResult | null>(null);
const visibleCount = ref(8);
const visibleProducts = computed(() => result.value?.products.slice(0, visibleCount.value) ?? []);
watch(result, () => { visibleCount.value = 8; });
const examples = ["Gaming phone under PKR 80,000", "Wireless headphones with long battery", "Gift for a home cook"];
async function ask() {
  if (!query.value.trim()) return;
  loading.value = true; error.value = ""; result.value = null;
  try {
    if (intelligenceApi.enabled) result.value = await intelligenceApi.assistant(query.value.trim());
    else {
      const terms = query.value.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
      const matched = products.filter((product) => terms.some((term) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term)));
      result.value = { provider:"local-demo", answer:matched.length ? `I found ${matched.length} product options based on your request.` : "Try a product type or feature such as headphones, phone, or battery.", criteria:{preferences:query.value}, products:matched };
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "The shopping assistant is unavailable."; }
  finally { loading.value = false; }
}
</script>

<template><div class="page-shell"><SiteHeader /><main class="container assistant-page"><div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Shopping assistant</span></div><section class="assistant-intro"><span class="assistant-icon"><Bot /></span><span class="eyebrow">BAZAARX SMART SHOPPING</span><h1>Tell us what you’re looking for.</h1><p>The assistant searches real BazaarX products and helps narrow down your options.</p><form @submit.prevent="ask"><Search /><input v-model="query" aria-label="Describe the product you need" placeholder="e.g. black headphones under PKR 15,000" /><button :disabled="loading || !query.trim()"><Send />{{ loading ? 'Searching…' : 'Find products' }}</button></form><div class="assistant-examples"><button v-for="example in examples" :key="example" @click="query=example; ask()">{{ example }}</button></div></section><p v-if="error" class="assistant-error" role="alert">{{ error }}</p><p v-if="loading" class="assistant-state" role="status">Searching available BazaarX listings…</p><section v-if="result" class="assistant-results"><div class="assistant-answer"><Sparkles /><div><b>{{ result.answer }}</b><small v-if="result.criteria.budget">Budget matched: up to PKR {{ result.criteria.budget.toLocaleString('en-PK') }}</small></div></div><div v-if="result.products.length" class="product-grid"><ProductCard v-for="product in visibleProducts" :key="product.id" :product="product" /></div><button v-if="result.products.length && visibleCount < result.products.length" class="load-more-button" @click="visibleCount = Math.min(visibleCount + 8, result.products.length)">Load more suggestions ({{ result.products.length - visibleCount }} left)</button><div v-if="!result.products.length" class="assistant-empty"><ShoppingCart /><b>No matching product yet</b><p>Try a broader description or adjust your budget.</p><RouterLink to="/search">Browse all products</RouterLink></div></section></main><SiteFooter /></div></template>

<style scoped>
.assistant-page{min-height:60vh;padding-bottom:50px}.assistant-intro{text-align:center;padding:44px 18px;background:linear-gradient(140deg,#fff8f4,#fff 60%,#f4f7ff);border:1px solid #e9edf3;border-radius:18px}.assistant-icon{width:53px;height:53px;margin:auto auto 12px;display:grid;place-items:center;background:#fff0e9;color:#ed4e1c;border-radius:16px}.assistant-icon svg{width:27px}.assistant-intro h1{font-size:clamp(25px,4vw,37px);color:#172841;margin:9px}.assistant-intro p{color:#718096}.assistant-intro form{max-width:700px;height:54px;display:flex;align-items:center;gap:10px;margin:22px auto 12px;padding:6px 7px 6px 14px;background:#fff;border:1px solid #dce4ee;border-radius:11px}.assistant-intro form>svg{color:#8291a3;flex:none}.assistant-intro input{flex:1;min-width:0;border:0;outline:0;font:inherit}.assistant-intro form button{display:flex;align-items:center;gap:7px;white-space:nowrap;border:0;border-radius:8px;padding:11px 14px;background:#f4511e;color:#fff;font-weight:700}.assistant-intro form button:disabled{opacity:.6}.assistant-intro form button svg{width:15px}.assistant-examples{display:flex;justify-content:center;flex-wrap:wrap;gap:8px}.assistant-examples button{border:1px solid #e0e6ed;background:white;border-radius:20px;padding:8px 11px;color:#52637a;font-size:11px;cursor:pointer}.assistant-results{margin-top:25px}.assistant-answer{display:flex;align-items:flex-start;gap:11px;padding:16px;margin-bottom:17px;border-radius:12px;background:#f4f8ff;color:#243853}.assistant-answer>svg{color:#ee541f;flex:none}.assistant-answer div{display:grid;gap:5px}.assistant-answer small,.assistant-state{color:#748398;font-size:12px}.assistant-empty{text-align:center;padding:48px 15px;border:1px dashed #dce3eb;border-radius:13px;color:#75849a}.assistant-empty svg{color:#f4511e}.assistant-empty b{display:block;margin:8px;color:#1e3049}.assistant-empty a{color:#ed4e1c}.assistant-error{color:#b53b24}@media(max-width:560px){.assistant-intro{padding:30px 13px}.assistant-intro form{height:auto;flex-wrap:wrap}.assistant-intro form input{min-height:40px}.assistant-intro form button{width:100%;justify-content:center}}
</style>
