<script setup lang="ts">
import { computed } from "vue";
import { sellerData, formatPKR } from "../data";
import {
  ArrowRight,
  Boxes,
  Package,
  ShoppingBag,
  ChartNoAxesCombined,
  TriangleAlert,
} from "lucide-vue-next";
const lowStock = computed(() =>
  sellerData.products.filter((p) => p.stock < 10),
);
const activeProducts = computed(
  () => sellerData.products.filter((p) => p.status === "Active").length,
);
</script>
<template>
  <section class="page-content">
    <div class="view-heading">
      <div>
        <span class="eyebrow">YOUR BUSINESS AT A GLANCE</span>
        <h1>Dashboard</h1>
        <p>Here's what's happening with your store today.</p>
      </div>
      <RouterLink to="/products/new" class="primary-button"
        >Add a product <ArrowRight
      /></RouterLink>
    </div>
    <div class="metric-grid">
      <article>
        <span><ChartNoAxesCombined /></span><small>Total sales</small
        ><b>PKR 245,830</b><i>↑ 12% this month</i>
      </article>
      <article>
        <span><ShoppingBag /></span><small>Open orders</small
        ><b>{{
          sellerData.orders.filter(
            (o) => o.status === "Pending" || o.status === "Processing",
          ).length
        }}</b
        ><i>Needs your attention</i>
      </article>
      <article>
        <span><Package /></span><small>Active products</small
        ><b>{{ activeProducts }}</b
        ><i>{{ sellerData.products.length }} total listings</i>
      </article>
      <article>
        <span><Boxes /></span><small>Low stock</small
        ><b>{{ lowStock.length }}</b
        ><i>Review inventory</i>
      </article>
    </div>
    <div class="dashboard-grid">
      <section class="seller-panel">
        <div class="panel-top">
          <div>
            <h2>Recent orders</h2>
            <p>Latest customer orders from your store</p>
          </div>
          <RouterLink to="/orders">View all <ArrowRight /></RouterLink>
        </div>
        <div class="seller-table-wrap">
          <table class="seller-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in sellerData.orders.slice(0, 4)"
                :key="order.id"
              >
                <td>{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>PKR {{ formatPKR(order.amount) }}</td>
                <td>
                  <span
                    class="status-chip"
                    :class="`status-${order.status.toLowerCase()}`"
                    >{{ order.status }}</span
                  >
                </td>
                <td>
                  <RouterLink :to="`/orders/${order.id}`">Details</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="seller-panel stock-panel">
        <div class="panel-top">
          <div>
            <h2>Inventory alerts</h2>
            <p>Products that need a stock check</p>
          </div>
          <RouterLink to="/inventory">Manage <ArrowRight /></RouterLink>
        </div>
        <div v-for="product in lowStock" :key="product.id" class="stock-alert">
          <TriangleAlert /><span
            ><b>{{ product.title }}</b
            ><small>{{
              product.stock === 0
                ? "Out of stock"
                : `${product.stock} units remaining`
            }}</small></span
          ><RouterLink :to="`/products/${product.id}/edit`">Update</RouterLink>
        </div>
        <div v-if="!lowStock.length" class="small-empty">
          All products have healthy stock.
        </div>
      </section>
    </div>
  </section>
</template>
