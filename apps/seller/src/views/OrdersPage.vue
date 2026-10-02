<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { sellerData, formatPKR } from "../data";
import { Search } from "lucide-vue-next";
import { marketplaceApi } from "../services/marketplace";
const term = ref("");
const status = ref("All");
const loading = ref(false);
const error = ref("");
onMounted(async () => {
  if (!marketplaceApi.enabled) return;
  loading.value = true;
  try {
    const response = await marketplaceApi.orders();
    const rows = response.data.flatMap((order) => {
      const items = order.items.filter((item) => item.seller.toLowerCase() === "techstore official");
      if (!items.length) return [];
      const state = order.status === "DELIVERED" ? "Delivered" : order.status === "SHIPPED" ? "Shipped" : order.status === "PACKED" ? "Packed" : order.status === "SELLER_PROCESSING" ? "Processing" : "Pending";
      return [{ id: order.id, customer: "Marketplace customer", product: items.map((item) => `${item.name} × ${item.quantity}`).join(", "), amount: items.reduce((sum, item) => sum + item.price * item.quantity, 0), status: state as "Processing" | "Pending" | "Packed" | "Shipped" | "Delivered", date: new Date(order.createdAt).toLocaleDateString() }];
    });
    sellerData.orders = rows;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "Orders could not be loaded."; }
  finally { loading.value = false; }
});
const orders = computed(() =>
  sellerData.orders.filter(
    (o) =>
      (status.value === "All" || o.status === status.value) &&
      `${o.id} ${o.customer} ${o.product}`
        .toLowerCase()
        .includes(term.value.toLowerCase()),
  ),
);
</script>
<template>
  <section class="page-content">
    <div class="view-heading">
      <div>
        <span class="eyebrow">FULFILMENT</span>
        <h1>Orders</h1>
        <p>Review incoming orders and update fulfilment progress.</p>
      </div>
    </div>
    <div class="seller-panel">
      <p v-if="loading" role="status" class="mock-note">Loading orders from the BazaarX API…</p>
      <p v-if="error" role="alert" class="form-alert">{{ error }}</p>
      <div class="product-tools">
        <label
          ><Search /><input
            v-model="term"
            aria-label="Search orders"
            placeholder="Search order, customer or item" /></label
        ><select v-model="status" aria-label="Filter order status">
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>
      <div class="seller-table-wrap">
        <table class="seller-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.product }}</td>
              <td>PKR {{ formatPKR(order.amount) }}</td>
              <td>
                <span
                  class="status-chip"
                  :class="`status-${order.status.toLowerCase()}`"
                  >{{ order.status }}</span
                >
              </td>
              <td>{{ order.date }}</td>
              <td>
                <RouterLink :to="`/orders/${order.id}`" class="table-action"
                  >Fulfil</RouterLink
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!orders.length" class="small-empty">
        No orders match this filter.
      </div>
    </div>
  </section>
</template>
