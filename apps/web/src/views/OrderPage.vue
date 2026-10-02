<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  Check,
  Clock3,
  PackageCheck,
  Truck,
  MapPin,
  CreditCard,
  MessageCircle,
  RotateCcw,
} from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import StatusView from "../components/StatusView.vue";
const shop = useShopStore();
const route = useRoute();
const order = computed(() =>
  shop.orders.find((item) => item.id === route.params.orderId),
);
function money(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
function date(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
const steps = [
  { name: "Order placed", icon: Check },
  { name: "Seller processing", icon: PackageCheck },
  { name: "Shipped", icon: Truck },
  { name: "Delivered", icon: MapPin },
];
const activeStep = computed(() =>
  order.value?.status === "PLACED" || order.value?.status === "PAYMENT_PENDING"
    ? 0
    : order.value?.status === "SELLER_PROCESSING" ||
        order.value?.status === "PACKED"
      ? 1
      : order.value?.status === "SHIPPED"
        ? 2
        : order.value?.status === "DELIVERED"
          ? 3
          : -1,
);
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><RouterLink to="/account/orders">My orders</RouterLink><span>/</span
        ><span>Order details</span>
      </div>
      <template v-if="order"
        ><div class="page-title-row">
          <div>
            <span class="eyebrow">ORDER CONFIRMATION</span>
            <h1>Order {{ order.id }}</h1>
            <p>Placed {{ date(order.createdAt) }}</p>
          </div>
          <span class="order-status">{{
            order.status.replaceAll("_", " ")
          }}</span>
        </div>
        <div class="tracking-steps">
          <div
            v-for="(step, index) in steps"
            :key="step.name"
            class="tracking-step"
            :class="{ complete: index <= activeStep }"
          >
            <span><component :is="step.icon" /></span><b>{{ step.name }}</b>
          </div>
        </div>
        <div class="order-detail-layout">
          <section class="account-panel">
            <div class="panel-heading">
              <div>
                <h2>Items in this order</h2>
                <p>{{ order.items.length }} product types</p>
              </div>
            </div>
            <article
              v-for="item in order.items"
              :key="item.productId"
              class="order-product"
            >
              <img :src="item.image" :alt="item.name" /><span
                ><b>{{ item.name }}</b
                ><small
                  >{{ item.seller }} · Qty {{ item.quantity }}</small
                ></span
              ><strong>PKR {{ money(item.price * item.quantity) }}</strong>
            </article>
          </section>
          <aside class="order-summary">
            <h2>Order information</h2>
            <div class="summary-row">
              <span>Items</span><b>PKR {{ money(order.subtotal) }}</b>
            </div>
            <div class="summary-row">
              <span>Delivery</span
              ><b>{{
                order.deliveryFee === 0
                  ? "FREE"
                  : `PKR ${money(order.deliveryFee)}`
              }}</b>
            </div>
            <div class="summary-divider" />
            <div class="summary-row summary-total">
              <span>Total paid</span><b>PKR {{ money(order.total) }}</b>
            </div>
            <div class="order-info-row">
              <MapPin /><span
                ><b>Delivery address</b><small>{{ order.address }}</small></span
              >
            </div>
            <div class="order-action-links">
              <RouterLink :to="`/orders/${order.id}/tracking`"><Truck /> Track delivery</RouterLink>
              <RouterLink to="/returns"><RotateCcw /> Request return or refund</RouterLink>
              <RouterLink :to="`/chat/${encodeURIComponent(order.items[0]?.seller ?? 'TechStore Official')}`"><MessageCircle /> Message seller</RouterLink>
            </div>
            <div class="order-info-row">
              <CreditCard /><span
                ><b>Payment</b><small>{{ order.paymentMethod }}</small></span
              >
            </div>
            <div class="order-info-row">
              <Clock3 /><span
                ><b>Delivery method</b
                ><small>{{ order.deliveryMethod }}</small></span
              >
            </div>
          </aside>
        </div></template
      ><StatusView
        v-else
        mode="empty"
        title="Order not found"
        message="This order is not saved in this browser session."
      /><RouterLink to="/account/orders" class="text-link order-back"
        >Back to my orders</RouterLink
      >
    </main>
    <SiteFooter />
  </div>
</template>
