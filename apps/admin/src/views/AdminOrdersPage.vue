<script setup lang="ts">
import { computed, ref } from "vue";
import { adminData, formatPKR } from "../data";
import { Search } from "lucide-vue-next";
const query = ref("");
const status = ref("All");
const rows = computed(() =>
  adminData.orders.filter(
    (o) =>
      (status.value === "All" || o.status === status.value) &&
      `${o.id} ${o.customer}`.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
</script>
<template>
  <section class="admin-content">
    <div class="admin-heading">
      <div>
        <span class="eyebrow">ORDER OPERATIONS</span>
        <h1>Orders management</h1>
        <p>Review order status and payment method across the marketplace.</p>
      </div>
    </div>
    <div class="admin-panel">
      <div class="admin-tools">
        <label
          ><Search /><input
            v-model="query"
            aria-label="Search orders"
            placeholder="Search order or customer" /></label
        ><select v-model="status" aria-label="Filter order status">
          <option>All</option>
          <option>Processing</option>
          <option>Payment pending</option>
          <option>Shipped</option>
        </select>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in rows" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.customer }}</td>
              <td>PKR {{ formatPKR(order.total) }}</td>
              <td>{{ order.payment }}</td>
              <td>
                <span
                  class="admin-status"
                  :class="order.status === 'Shipped' ? 'approved' : 'pending'"
                  >{{ order.status }}</span
                >
              </td>
              <td>{{ order.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!rows.length" class="admin-empty">
        No orders match this filter.
      </div>
    </div>
  </section>
</template>
