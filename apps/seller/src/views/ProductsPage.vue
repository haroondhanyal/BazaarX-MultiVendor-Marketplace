<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { sellerData, formatPKR } from "../data";
import { Search, Plus, Package, MoreVertical } from "lucide-vue-next";
const query = ref("");
const filter = ref("All");
const visibleCount = ref(10);
const rows = computed(() =>
  sellerData.products.filter(
    (p) =>
      (filter.value === "All" || p.status === filter.value) &&
      p.title.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
const visibleRows = computed(() => rows.value.slice(0, visibleCount.value));
watch([query, filter], () => { visibleCount.value = 10; });
function removeProduct(id: string) {
  sellerData.products = sellerData.products.filter((p) => p.id !== id);
}
</script>
<template>
  <section class="page-content">
    <div class="view-heading">
      <div>
        <span class="eyebrow">YOUR CATALOG</span>
        <h1>Products</h1>
        <p>Manage product listings, prices and availability.</p>
      </div>
      <RouterLink to="/products/new" class="primary-button"
        ><Plus /> Add product</RouterLink
      >
    </div>
    <div class="seller-panel product-list-panel">
      <div class="product-tools">
        <label
          ><Search /><input
            v-model="query"
            aria-label="Search products"
            placeholder="Search products or SKU" /></label
        ><select v-model="filter" aria-label="Filter by product status">
          <option>All</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Under review</option>
        </select>
      </div>
      <div class="seller-table-wrap">
        <table class="seller-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in visibleRows" :key="product.id">
              <td>
                <span class="table-product"
                  ><span><Package /></span
                  ><b
                    >{{ product.title }}<small>{{ product.category }}</small></b
                  ></span
                >
              </td>
              <td>{{ product.sku }}</td>
              <td>PKR {{ formatPKR(product.price) }}</td>
              <td :class="{ 'low-stock-text': product.stock < 10 }">
                {{ product.stock }}
              </td>
              <td>
                <span
                  class="status-chip"
                  :class="
                    product.status === 'Active'
                      ? 'status-delivered'
                      : 'status-pending'
                  "
                  >{{ product.status }}</span
                >
              </td>
              <td>
                <RouterLink
                  class="table-action"
                  :to="`/products/${product.id}/edit`"
                  >Edit</RouterLink
                ><button
                  class="table-icon-action"
                  :aria-label="`Remove ${product.title}`"
                  @click="removeProduct(product.id)"
                >
                  <MoreVertical />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="load-more-button" :disabled="visibleCount >= rows.length" @click="visibleCount = Math.min(visibleCount + 10, rows.length)">{{ visibleCount < rows.length ? `Load more products (${rows.length - visibleCount} left)` : 'All products loaded' }}</button>
      <div v-if="!rows.length" class="small-empty">
        No matching products. Change the search or add a product.
      </div>
    </div>
  </section>
</template>
