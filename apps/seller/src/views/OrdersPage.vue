<script setup lang="ts">
import { computed, ref } from "vue";
import { sellerData, formatPKR } from "../data";
import { Search } from "lucide-vue-next";
const term = ref("");
const status = ref("All");
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
