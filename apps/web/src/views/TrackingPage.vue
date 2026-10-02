<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Check, MapPin, PackageCheck, Truck } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";

const route = useRoute();
const shop = useShopStore();
const order = computed(() => shop.orders.find((item) => item.id === route.params.orderId) ?? shop.orders[0]);
const steps = [
  { label: "Order confirmed", icon: Check },
  { label: "Seller processing", icon: PackageCheck },
  { label: "On its way", icon: Truck },
  { label: "Delivered", icon: MapPin },
];
const activeStep = computed(() => {
  const status = order.value?.status;
  if (status === "DELIVERED") return 3;
  if (status === "SHIPPED") return 2;
  if (["PACKED", "SELLER_PROCESSING"].includes(status ?? "")) return 1;
  return 0;
});
</script>

<template>
  <div class="page-shell"><SiteHeader /><main class="container content-page">
    <div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><RouterLink to="/account/orders">My orders</RouterLink><span>/</span><span>Track order</span></div>
    <template v-if="order">
      <div class="buyer-tool-heading"><div><span class="eyebrow">ORDER TRACKING</span><h1>Follow your delivery</h1><p>{{ order.id }} · {{ new Date(order.createdAt).toLocaleDateString() }}</p></div><span class="buyer-status">{{ order.status.replaceAll("_", " ") }}</span></div>
      <section class="buyer-tool-card"><div class="buyer-progress"><div v-for="(step, index) in steps" :key="step.label" class="buyer-progress-step" :class="{ active: index <= activeStep }"><span><component :is="step.icon" /></span><b>{{ step.label }}</b></div></div><div class="buyer-tool-info"><MapPin /><div><b>Delivery address</b><p>{{ order.address }}</p></div></div><div class="buyer-tool-info"><Truck /><div><b>{{ order.deliveryMethod }} delivery</b><p>Shipment updates will appear here as the seller processes your order.</p></div></div><RouterLink :to="`/account/orders/${order.id}`" class="buyer-tool-button">View order details</RouterLink></section>
    </template>
    <section v-else class="buyer-tool-card buyer-tool-empty"><Truck /><h2>No order to track</h2><p>Your placed orders will appear here with delivery updates.</p><RouterLink to="/search" class="buyer-tool-button">Browse marketplace</RouterLink></section>
  </main><SiteFooter /></div>
</template>

<style scoped>
.buyer-tool-heading,.buyer-tool-info,.buyer-progress-step{display:flex;align-items:center}.buyer-tool-heading{justify-content:space-between;margin:25px 0}.buyer-tool-heading h1{margin:8px 0;font-size:30px;color:#14243c}.buyer-tool-heading p,.buyer-tool-info p{color:#738198;margin:4px 0}.buyer-status{background:#eaf2ff;color:#2260ce;padding:8px 12px;border-radius:30px;font-size:12px;font-weight:700}.buyer-tool-card{background:white;border:1px solid #e8edf3;border-radius:16px;padding:26px;box-shadow:0 10px 28px #2135500a}.buyer-progress{display:grid;grid-template-columns:repeat(4,1fr);margin:24px 0 35px}.buyer-progress-step{position:relative;gap:10px;flex-direction:column;color:#8994a4;font-size:12px}.buyer-progress-step:not(:last-child):after{content:"";height:2px;background:#e4eaf1;position:absolute;left:60%;right:-40%;top:19px}.buyer-progress-step.active:after{background:#ff581e}.buyer-progress-step span{z-index:1;border-radius:50%;background:#eff2f6;width:38px;height:38px;display:grid;place-items:center}.buyer-progress-step.active span{background:#fff0e9;color:#f4511e}.buyer-tool-info{gap:14px;border-top:1px solid #edf0f4;padding:17px 0}.buyer-tool-info>svg{color:#f4511e}.buyer-tool-info b{color:#1c2b41}.buyer-tool-button{display:inline-flex;background:#f4511e;color:white;border:0;border-radius:9px;padding:11px 17px;font-weight:700;text-decoration:none;margin-top:10px;cursor:pointer}.buyer-tool-empty{text-align:center;padding:65px 20px}.buyer-tool-empty>svg{color:#f4511e;width:34px;height:34px}.buyer-tool-empty p{color:#738198}@media(max-width:620px){.buyer-tool-heading{align-items:flex-start;gap:12px;flex-direction:column}.buyer-tool-heading h1{font-size:25px}.buyer-progress-step{font-size:10px;text-align:center}.buyer-progress-step:not(:last-child):after{left:65%;right:-35%}.buyer-tool-card{padding:17px}}
</style>
