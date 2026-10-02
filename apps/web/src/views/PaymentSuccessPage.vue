<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Check, PackageCheck, ArrowRight, ShoppingBag } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
const route = useRoute();
const shop = useShopStore();
const order = computed(
  () =>
    shop.orders.find((item) => item.id === String(route.query.orderId)) ??
    shop.orders[0],
);
function money(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page success-page">
      <div v-if="order" class="success-card">
        <span class="success-icon"><Check /></span
        ><span class="eyebrow">ORDER RECEIVED</span>
        <h1>Thanks for shopping BazaarX.</h1>
        <p>
          Your order <b>{{ order.id }}</b> has been placed. We’ll keep your
          order updates here.
        </p>
        <div class="success-summary">
          <PackageCheck /><span
            ><b>Order total</b
            ><small
              >PKR {{ money(order.total) }} ·
              {{
                order.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : order.paymentMethod
              }}</small
            ></span
          >
        </div>
        <div class="success-actions">
          <RouterLink
            :to="`/account/orders/${order.id}`"
            class="button button-primary"
            >View order <ArrowRight /></RouterLink
          ><RouterLink to="/search" class="button button-outline"
            ><ShoppingBag /> Continue shopping</RouterLink
          >
        </div>
      </div>
      <div v-else class="empty-card">
        <h1>Order confirmation unavailable</h1>
        <RouterLink to="/account/orders" class="button button-primary"
          >View my orders</RouterLink
        >
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
