<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { sellerData, formatPKR } from "../data";
import { ArrowLeft, Check, PackageCheck, Truck } from "lucide-vue-next";
const route = useRoute();
const router = useRouter();
const order = computed(() =>
  sellerData.orders.find((o) => o.id === route.params.id),
);
function advance() {
  if (!order.value) return;
  const next = {
    Pending: "Processing",
    Processing: "Shipped",
    Shipped: "Delivered",
    Delivered: "Delivered",
  } as const;
  order.value.status = next[order.value.status];
  if (order.value.status === "Delivered") router.push("/orders");
}
</script>
<template>
  <section class="page-content">
    <RouterLink to="/orders" class="back-link"
      ><ArrowLeft /> Back to orders</RouterLink
    ><template v-if="order"
      ><div class="view-heading">
        <div>
          <span class="eyebrow">ORDER FULFILMENT</span>
          <h1>{{ order.id }}</h1>
          <p>Order placed {{ order.date }} by {{ order.customer }}.</p>
        </div>
        <span
          class="status-chip"
          :class="`status-${order.status.toLowerCase()}`"
          >{{ order.status }}</span
        >
      </div>
      <div class="order-detail-grid-seller">
        <section class="seller-panel">
          <div class="panel-top">
            <div>
              <h2>Order item</h2>
              <p>Marketplace order for your store</p>
            </div>
          </div>
          <div class="seller-order-product">
            <PackageCheck /><span
              ><b>{{ order.product }}</b
              ><small>Fulfilled by your BazaarX store</small></span
            ><strong>PKR {{ formatPKR(order.amount) }}</strong>
          </div>
          <div class="fulfilment-timeline">
            <span class="done"><Check />Order placed</span
            ><span :class="{ done: order.status !== 'Pending' }"
              ><PackageCheck />Processing</span
            ><span
              :class="{
                done:
                  order.status === 'Shipped' || order.status === 'Delivered',
              }"
              ><Truck />Shipped</span
            ><span :class="{ done: order.status === 'Delivered' }"
              ><Check />Delivered</span
            >
          </div>
        </section>
        <aside class="seller-panel fulfilment-panel">
          <h2>Update fulfilment</h2>
          <p>Advance this order to the next state.</p>
          <div class="fulfilment-facts">
            <span
              >Customer<b>{{ order.customer }}</b></span
            ><span
              >Order total<b>PKR {{ formatPKR(order.amount) }}</b></span
            ><span
              >Current status<b>{{ order.status }}</b></span
            >
          </div>
          <button
            class="primary-button"
            :disabled="order.status === 'Delivered'"
            @click="advance"
          >
            {{
              order.status === "Pending"
                ? "Accept order"
                : order.status === "Processing"
                  ? "Mark as shipped"
                  : order.status === "Shipped"
                    ? "Mark delivered"
                    : "Order completed"
            }}
            <Check />
          </button>
          <p class="mock-note">
            Demo fulfilment updates are stored in this browser.
          </p>
        </aside>
      </div></template
    >
    <div v-else class="seller-panel small-empty">
      Order not found in the demo store.
    </div>
  </section>
</template>
