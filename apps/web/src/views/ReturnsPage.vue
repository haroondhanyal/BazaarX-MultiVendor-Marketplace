<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RotateCcw, Upload, CheckCircle2 } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { commerceApi, type ReturnRecord } from "../services/commerce";
import { orderApi } from "../services/orders";

interface ReturnRequest {
  id: string; orderId: string; item: string; reason: string; details: string;
  createdAt: string; status: string; evidence: string[];
}
const shop = useShopStore();
const selectedOrder = ref(shop.orders[0]?.id ?? "");
const selectedItem = ref("");
const reason = ref("damaged");
const refundMethod = ref("original payment");
const details = ref("");
const saved = ref(false);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const evidence = ref<string[]>([]);
const requests = ref<ReturnRequest[]>(JSON.parse(localStorage.getItem("bx-returns") ?? "[]") as ReturnRequest[]);
const order = computed(() => shop.orders.find((item) => item.id === selectedOrder.value));
const returnableOrders = computed(() => shop.orders.filter((item) => item.status === "DELIVERED"));

function mapRequest(item: ReturnRecord): ReturnRequest {
  return { id: item.id, orderId: item.orderId, item: item.itemName, reason: item.reason, details: item.description, createdAt: item.createdAt, status: item.status, evidence: item.evidence };
}
function onEvidence(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  evidence.value = files ? Array.from(files).slice(0, 5).map((file) => file.name) : [];
}
onMounted(async () => {
  if (!commerceApi.enabled) return;
  loading.value = true;
  try {
    const [orders, returns] = await Promise.all([orderApi.list(), commerceApi.returns()]);
    orders.forEach((item) => shop.updateOrder(item));
    requests.value = returns.data.map(mapRequest);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "Return requests could not be loaded."; }
  finally { loading.value = false; }
});
async function submit() {
  error.value = "";
  if (!order.value || !selectedItem.value) return;
  submitting.value = true;
  try {
    if (commerceApi.enabled) {
      const created = await commerceApi.submitReturn({ orderId: order.value.id, productId: selectedItem.value, reason: reason.value, description: details.value.trim(), refundMethod: refundMethod.value, evidence: evidence.value });
      requests.value.unshift(mapRequest(created));
    } else {
      const product = order.value.items.find((item) => item.productId === selectedItem.value);
      requests.value.unshift({ id: `RET-${Date.now().toString().slice(-6)}`, orderId: order.value.id, item: product?.name ?? "Product", reason: reason.value, details: details.value.trim(), createdAt: new Date().toISOString(), status: "REQUESTED", evidence: evidence.value });
    }
    localStorage.setItem("bx-returns", JSON.stringify(requests.value));
    saved.value = true;
    details.value = "";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "Return request could not be submitted."; }
  finally { submitting.value = false; }
}
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Returns & refunds</span></div>
      <div class="buyer-tool-heading"><div><span class="eyebrow">AFTER-SALES CARE</span><h1>Returns & refunds</h1><p>Follow every step, from the pickup through your refund.</p></div><RotateCcw class="heading-icon" /></div>
      <p v-if="error" class="form-alert" role="alert">{{ error }}</p>
      <div v-if="loading" class="inline-empty" role="status">Loading your return history…</div>
      <div class="returns-layout">
        <form class="buyer-tool-card return-form" @submit.prevent="submit">
          <h2>Request a return or refund</h2><p>Choose a delivered purchase and tell us what went wrong.</p>
          <div v-if="!returnableOrders.length" class="inline-empty">Returns are available after delivery. <RouterLink to="/account/orders">View your orders</RouterLink></div>
          <template v-else>
            <label>Order<select v-model="selectedOrder" required><option v-for="item in returnableOrders" :key="item.id" :value="item.id">{{ item.id }} · {{ new Date(item.createdAt).toLocaleDateString() }}</option></select></label>
            <label>Product<select v-model="selectedItem" required><option value="" disabled>Select a product</option><option v-for="item in order?.items ?? []" :key="item.productId" :value="item.productId">{{ item.name }}</option></select></label>
            <label>Reason<select v-model="reason"><option value="damaged">Damaged</option><option value="defective">Defective</option><option value="wrong item">Wrong item</option><option value="missing parts">Missing parts</option><option value="size issue">Size issue</option><option value="different item">Different item</option><option value="other">Other</option></select></label>
            <label>Refund destination<select v-model="refundMethod"><option value="original payment">Original payment method</option><option value="BazaarX Wallet">BazaarX Wallet</option></select></label>
            <label>Additional details<textarea v-model="details" rows="4" placeholder="Describe the issue so we can help."></textarea></label>
            <label>Evidence images (up to 5)<input type="file" accept="image/*" multiple @change="onEvidence" /><small v-if="evidence.length">{{ evidence.join(", ") }}</small></label>
            <button class="buyer-tool-button" type="submit" :disabled="submitting">{{ submitting ? "Submitting…" : "Submit request" }}</button>
            <p v-if="saved" class="success-note" role="status"><CheckCircle2 /> Request received. Track its progress below.</p>
          </template>
        </form>
        <section class="buyer-tool-card"><h2>Your requests</h2><p>Return and refund updates</p>
          <div v-if="requests.length" class="request-list"><article v-for="item in requests" :key="item.id"><span class="request-icon"><RotateCcw /></span><div><b>{{ item.item }}</b><small>{{ item.id }} · Order {{ item.orderId }} · {{ item.reason }}</small><small>{{ new Date(item.createdAt).toLocaleDateString() }} · {{ item.evidence.length }} evidence file(s)</small><div v-if="item.status !== 'REFUNDED' && item.status !== 'REJECTED'" class="return-timeline">{{ item.status.replaceAll("_", " ").toLowerCase() }} → pickup → inspection → refund</div></div><span class="request-status">{{ item.status }}</span></article></div>
          <div v-else class="inline-empty"><Upload /><b>No return requests yet</b><span>Once submitted, requests and their status show here.</span></div>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.buyer-tool-heading{display:flex;align-items:center;justify-content:space-between;margin:24px 0}.buyer-tool-heading h1{font-size:30px;color:#14243c;margin:8px 0}.buyer-tool-heading p,.buyer-tool-card>p{color:#738198;margin:4px 0 18px}.heading-icon{color:#f4511e;width:32px;height:32px}.returns-layout{display:grid;grid-template-columns:1fr 1fr;gap:18px}.buyer-tool-card{background:white;border:1px solid #e8edf3;border-radius:15px;padding:23px;box-shadow:0 10px 28px #2135500a}.buyer-tool-card h2{font-size:18px;color:#1d2c43;margin:0}.return-form label{display:grid;gap:7px;margin:15px 0;font-size:13px;font-weight:700;color:#26364e}.return-form select,.return-form textarea,.return-form input[type=file]{font:inherit;font-weight:400;color:#26364e;border:1px solid #dce3eb;border-radius:8px;padding:11px;background:#fff;min-width:0}.buyer-tool-button{display:inline-flex;background:#f4511e;color:white;border:0;border-radius:8px;padding:11px 15px;font-weight:700;text-decoration:none;cursor:pointer}.buyer-tool-button:disabled{opacity:.55}.inline-empty{min-height:140px;display:flex;align-items:center;justify-content:center;gap:9px;flex-direction:column;color:#77859a;text-align:center;font-size:12px}.inline-empty svg{color:#f4511e}.inline-empty a{color:#f4511e}.request-list article{display:flex;align-items:center;gap:12px;border-top:1px solid #edf0f4;padding:15px 0}.request-icon{width:37px;height:37px;background:#fff0e9;color:#f4511e;border-radius:10px;display:grid;place-items:center;flex:none}.request-list article>div{flex:1;min-width:0;display:grid;gap:4px}.request-list small{color:#7a8798;font-size:11px}.request-status{font-size:10px;border-radius:30px;background:#edf4ff;color:#2563c9;padding:6px 8px}.return-timeline{font-size:9px;color:#7f8b9a}.success-note{display:flex;align-items:center;gap:7px;color:#168955;font-size:12px}.success-note svg{width:16px}@media(max-width:700px){.returns-layout{grid-template-columns:1fr}.buyer-tool-heading h1{font-size:25px}}
</style>
