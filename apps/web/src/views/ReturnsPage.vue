<script setup lang="ts">
import { computed, ref } from "vue";
import { RotateCcw, Upload, CheckCircle2 } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";

interface ReturnRequest { id: string; orderId: string; item: string; reason: string; details: string; createdAt: string; status: string }
const shop = useShopStore();
const selectedOrder = ref(shop.orders[0]?.id ?? "");
const selectedItem = ref("");
const reason = ref("Damaged or defective");
const details = ref("");
const saved = ref(false);
const requests = ref<ReturnRequest[]>(JSON.parse(localStorage.getItem("bx-returns") ?? "[]") as ReturnRequest[]);
const order = computed(() => shop.orders.find((item) => item.id === selectedOrder.value));
const returnableOrders = computed(() => shop.orders.filter((item) => ["DELIVERED", "SHIPPED", "PLACED", "SELLER_PROCESSING", "PACKED"].includes(item.status)));
function submit() {
  if (!order.value || !selectedItem.value) return;
  requests.value.unshift({ id: `RET-${Date.now().toString().slice(-6)}`, orderId: order.value.id, item: selectedItem.value, reason: reason.value, details: details.value.trim(), createdAt: new Date().toISOString(), status: "RECEIVED" });
  localStorage.setItem("bx-returns", JSON.stringify(requests.value));
  saved.value = true;
  details.value = "";
}
</script>

<template>
  <div class="page-shell"><SiteHeader /><main class="container content-page"><div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Returns & refunds</span></div>
    <div class="buyer-tool-heading"><div><span class="eyebrow">AFTER-SALES CARE</span><h1>Returns & refunds</h1><p>Tell us what happened and we’ll keep your request updated.</p></div><RotateCcw class="heading-icon" /></div>
    <div class="returns-layout"><form class="buyer-tool-card return-form" @submit.prevent="submit"><h2>Request a return or refund</h2><p>Choose an eligible purchase and share a few details.</p><div v-if="!returnableOrders.length" class="inline-empty">You don’t have an order available for a return yet. <RouterLink to="/search">Browse products</RouterLink></div><template v-else><label>Order<select v-model="selectedOrder" required><option v-for="item in returnableOrders" :key="item.id" :value="item.id">{{ item.id }} · {{ new Date(item.createdAt).toLocaleDateString() }}</option></select></label><label>Product<select v-model="selectedItem" required><option value="" disabled>Select a product</option><option v-for="item in order?.items ?? []" :key="item.productId" :value="item.name">{{ item.name }}</option></select></label><label>Reason<select v-model="reason"><option>Damaged or defective</option><option>Wrong item received</option><option>Missing parts</option><option>No longer needed</option><option>Other</option></select></label><label>Additional details<textarea v-model="details" rows="4" placeholder="Describe the issue so the seller can help."></textarea></label><button class="buyer-tool-button" type="submit">Submit request</button><p v-if="saved" class="success-note" role="status"><CheckCircle2 /> Request received. You can follow its status below.</p></template></form>
      <section class="buyer-tool-card"><h2>Your requests</h2><p>Return and refund updates</p><div v-if="requests.length" class="request-list"><article v-for="item in requests" :key="item.id"><span class="request-icon"><RotateCcw /></span><div><b>{{ item.item }}</b><small>{{ item.id }} · Order {{ item.orderId }} · {{ item.reason }}</small><small>{{ new Date(item.createdAt).toLocaleDateString() }}</small></div><span class="request-status">{{ item.status }}</span></article></div><div v-else class="inline-empty"><Upload /><b>No return requests yet</b><span>Once submitted, requests and their progress show here.</span></div></section></div>
  </main><SiteFooter /></div>
</template>

<style scoped>
.buyer-tool-heading{display:flex;align-items:center;justify-content:space-between;margin:24px 0}.buyer-tool-heading h1{font-size:30px;color:#14243c;margin:8px 0}.buyer-tool-heading p,.buyer-tool-card>p{color:#738198;margin:4px 0 18px}.heading-icon{color:#f4511e;width:32px;height:32px}.returns-layout{display:grid;grid-template-columns:1fr 1fr;gap:18px}.buyer-tool-card{background:white;border:1px solid #e8edf3;border-radius:15px;padding:23px;box-shadow:0 10px 28px #2135500a}.buyer-tool-card h2{font-size:18px;color:#1d2b40;margin:0}.return-form label{display:grid;gap:7px;margin:15px 0;font-size:13px;font-weight:700;color:#26364e}.return-form select,.return-form textarea{font:inherit;font-weight:400;color:#26364e;border:1px solid #dce3eb;border-radius:8px;padding:11px;background:#fff;min-width:0}.buyer-tool-button{display:inline-flex;background:#f4511e;color:white;border:0;border-radius:8px;padding:11px 15px;font-weight:700;text-decoration:none;cursor:pointer}.inline-empty{min-height:140px;display:flex;align-items:center;justify-content:center;gap:9px;flex-direction:column;color:#77859a;text-align:center}.inline-empty svg{color:#f4511e}.inline-empty a{color:#f4511e}.request-list article{display:flex;align-items:center;gap:12px;border-top:1px solid #edf0f4;padding:15px 0}.request-icon{width:37px;height:37px;background:#fff0e9;color:#f4511e;border-radius:10px;display:grid;place-items:center;flex:none}.request-list article>div{flex:1;min-width:0;display:grid;gap:4px}.request-list small{color:#7a8798;font-size:11px}.request-status{font-size:10px;border-radius:30px;background:#edf4ff;color:#2563c9;padding:6px 8px}.success-note{display:flex;align-items:center;gap:7px;color:#168955;font-size:12px}.success-note svg{width:16px}@media(max-width:700px){.returns-layout{grid-template-columns:1fr}.buyer-tool-heading h1{font-size:25px}}
</style>
