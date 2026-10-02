<script setup lang="ts">
import { computed, ref } from "vue";
import { adminData } from "../data";
import { Search, Check, X, Store } from "lucide-vue-next";
const query = ref("");
const status = ref("All");
const sellers = computed(() =>
  adminData.sellers.filter(
    (s) =>
      (status.value === "All" || s.status === status.value) &&
      `${s.name} ${s.location}`
        .toLowerCase()
        .includes(query.value.toLowerCase()),
  ),
);
function decide(id: string, status: "Approved" | "Rejected") {
  const seller = adminData.sellers.find((item) => item.id === id);
  if (seller) seller.status = status;
}
</script>
<template>
  <section class="admin-content">
    <div class="admin-heading">
      <div>
        <span class="eyebrow">SELLER GOVERNANCE</span>
        <h1>Seller approval</h1>
        <p>Review applications before stores can list products.</p>
      </div>
    </div>
    <div class="admin-panel">
      <div class="admin-tools">
        <label
          ><Search /><input
            v-model="query"
            aria-label="Search sellers"
            placeholder="Search seller or location" /></label
        ><select v-model="status" aria-label="Filter seller status">
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
              <th>Seller</th>
              <th>Location</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Review action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seller in sellers" :key="seller.id">
              <td>
                <span class="admin-entity"
                  ><i><Store /></i
                  ><b
                    >{{ seller.name }}<small>{{ seller.id }}</small></b
                  ></span
                >
              </td>
              <td>{{ seller.location }}</td>
              <td>{{ seller.submitted }}</td>
              <td>
                <span
                  class="admin-status"
                  :class="seller.status.toLowerCase()"
                  >{{ seller.status }}</span
                >
              </td>
              <td>
                <span
                  v-if="seller.status === 'Pending'"
                  class="admin-review-actions"
                  ><button
                    class="approve"
                    :aria-label="`Approve ${seller.name}`"
                    @click="decide(seller.id, 'Approved')"
                  >
                    <Check /> Approve</button
                  ><button
                    class="reject"
                    :aria-label="`Reject ${seller.name}`"
                    @click="decide(seller.id, 'Rejected')"
                  >
                    <X /> Reject
                  </button></span
                ><small v-else class="reviewed-label"
                  >Application reviewed</small
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!sellers.length" class="admin-empty">
        No applications match this search.
      </div>
    </div>
  </section>
</template>
