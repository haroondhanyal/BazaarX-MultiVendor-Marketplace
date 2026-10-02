<script setup lang="ts">
import { computed, ref } from "vue";
import { adminData, formatPKR } from "../data";
import {
  CreditCard,
  Wallet,
  Banknote,
  RefreshCw,
  Download,
} from "lucide-vue-next";
const paymentFilter = ref("All");
const rows = computed(() =>
  adminData.orders.filter(
    (o) =>
      paymentFilter.value === "All" ||
      o.payment.toLowerCase().includes(paymentFilter.value.toLowerCase()),
  ),
);
const total = computed(() =>
  adminData.orders
    .filter(
      (o) =>
        o.payment.toLowerCase().includes("paid") ||
        o.payment.toLowerCase().includes("authorized"),
    )
    .reduce((sum, o) => sum + o.total, 0),
);
function exportCsv() {
  const csv = [
    "Order,Customer,Total,Payment,Status",
    ...adminData.orders.map(
      (o) => `${o.id},${o.customer},${o.total},${o.payment},${o.status}`,
    ),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "bazaarx-payments-demo.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>
<template>
  <section class="admin-content">
    <div class="admin-heading">
      <div>
        <span class="eyebrow">PAYMENT OPERATIONS</span>
        <h1>Payments</h1>
        <p>Review mock payment states linked to marketplace orders.</p>
      </div>
      <button class="admin-secondary" @click="exportCsv">
        <Download /> Export CSV
      </button>
    </div>
    <div class="admin-metrics payment-metrics">
      <article>
        <CreditCard /><small>Captured / authorized</small
        ><b>PKR {{ formatPKR(total) }}</b
        ><span>Mock records</span>
      </article>
      <article>
        <Banknote /><small>Cash on delivery</small
        ><b>{{
          adminData.orders.filter((o) =>
            o.payment.toLowerCase().includes("cod"),
          ).length
        }}</b
        ><span>Payment due on arrival</span>
      </article>
      <article>
        <RefreshCw /><small>Needs reconciliation</small
        ><b>{{
          adminData.orders.filter((o) =>
            o.payment.toLowerCase().includes("pending"),
          ).length
        }}</b
        ><span>Pending payment state</span>
      </article>
    </div>
    <div class="admin-panel">
      <div class="admin-tools">
        <div class="payment-filter-label"><Wallet /> Payment records</div>
        <select v-model="paymentFilter" aria-label="Filter payment method">
          <option>All</option>
          <option>Card</option>
          <option>COD</option>
          <option>Wallet</option>
        </select>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Payment reference</th>
              <th>Order</th>
              <th>Method</th>
              <th>Amount</th>
              <th>State</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in rows" :key="order.id">
              <td>PAY-{{ order.id.slice(-6) }}</td>
              <td>{{ order.id }}</td>
              <td>{{ order.payment.split(" · ")[0] }}</td>
              <td>PKR {{ formatPKR(order.total) }}</td>
              <td>
                <span
                  class="admin-status"
                  :class="
                    order.payment.includes('Paid') ||
                    order.payment.includes('Authorized')
                      ? 'approved'
                      : 'pending'
                  "
                  >{{ order.payment.split(" · ")[1] }}</span
                >
              </td>
              <td>{{ order.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
