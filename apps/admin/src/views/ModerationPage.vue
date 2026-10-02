<script setup lang="ts">
import { computed, ref } from "vue";
import { adminData } from "../data";
import { Search, Check, X, Package } from "lucide-vue-next";
const query = ref("");
const status = ref("All");
const products = computed(() =>
  adminData.products.filter(
    (p) =>
      (status.value === "All" || p.status === status.value) &&
      `${p.name} ${p.seller} ${p.category}`
        .toLowerCase()
        .includes(query.value.toLowerCase()),
  ),
);
function decide(id: string, status: "Approved" | "Rejected") {
  const item = adminData.products.find((product) => product.id === id);
  if (item) item.status = status;
}
</script>
<template>
  <section class="admin-content">
    <div class="admin-heading">
      <div>
        <span class="eyebrow">CATALOG QUALITY</span>
        <h1>Product moderation</h1>
        <p>
          Approve product submissions before they appear in the marketplace.
        </p>
      </div>
    </div>
    <div class="admin-panel">
      <div class="admin-tools">
        <label
          ><Search /><input
            v-model="query"
            aria-label="Search product submissions"
            placeholder="Search products, sellers, categories" /></label
        ><select v-model="status" aria-label="Filter submission status">
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <span class="admin-entity"
                  ><i><Package /></i
                  ><b
                    >{{ product.name }}<small>{{ product.id }}</small></b
                  ></span
                >
              </td>
              <td>{{ product.seller }}</td>
              <td>{{ product.category }}</td>
              <td>{{ product.submitted }}</td>
              <td>
                <span
                  class="admin-status"
                  :class="product.status.toLowerCase()"
                  >{{ product.status }}</span
                >
              </td>
              <td>
                <span
                  v-if="product.status === 'Pending'"
                  class="admin-review-actions"
                  ><button
                    class="approve"
                    :aria-label="`Approve ${product.name}`"
                    @click="decide(product.id, 'Approved')"
                  >
                    <Check /> Approve</button
                  ><button
                    class="reject"
                    :aria-label="`Reject ${product.name}`"
                    @click="decide(product.id, 'Rejected')"
                  >
                    <X /> Reject
                  </button></span
                ><small v-else class="reviewed-label">Reviewed</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!products.length" class="admin-empty">
        No products match this filter.
      </div>
    </div>
  </section>
</template>
