<script setup lang="ts">
import { computed } from "vue";
import { sellerData } from "../data";
import { Boxes, TriangleAlert, ArrowRight } from "lucide-vue-next";
const inventory = computed(() =>
  sellerData.products.map((p) => ({
    ...p,
    availability:
      p.stock === 0 ? "Out of stock" : p.stock < 10 ? "Low stock" : "Healthy",
  })),
);
</script>
<template>
  <section class="page-content">
    <div class="view-heading">
      <div>
        <span class="eyebrow">STOCK CONTROL</span>
        <h1>Inventory</h1>
        <p>Monitor available units and update product quantities.</p>
      </div>
      <RouterLink to="/products" class="secondary-button"
        >Product catalog <ArrowRight
      /></RouterLink>
    </div>
    <div class="inventory-summary">
      <article>
        <Boxes /><span
          ><b>{{ sellerData.products.reduce((sum, p) => sum + p.stock, 0) }}</b
          ><small>Total units</small></span
        >
      </article>
      <article>
        <TriangleAlert /><span
          ><b>{{
            sellerData.products.filter((p) => p.stock > 0 && p.stock < 10)
              .length
          }}</b
          ><small>Low stock</small></span
        >
      </article>
      <article>
        <TriangleAlert /><span
          ><b>{{ sellerData.products.filter((p) => p.stock === 0).length }}</b
          ><small>Out of stock</small></span
        >
      </article>
    </div>
    <div class="seller-panel">
      <div class="panel-top">
        <div>
          <h2>Inventory by product</h2>
          <p>Stock values update as you edit a product listing.</p>
        </div>
      </div>
      <div class="seller-table-wrap">
        <table class="seller-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Available units</th>
              <th>Stock status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in inventory" :key="product.id">
              <td>{{ product.title }}</td>
              <td>{{ product.sku }}</td>
              <td>{{ product.stock }}</td>
              <td>
                <span
                  class="status-chip"
                  :class="
                    product.stock === 0
                      ? 'status-cancelled'
                      : product.stock < 10
                        ? 'status-pending'
                        : 'status-delivered'
                  "
                  >{{ product.availability }}</span
                >
              </td>
              <td>
                <RouterLink
                  :to="`/products/${product.id}/edit`"
                  class="table-action"
                  >Update stock</RouterLink
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
