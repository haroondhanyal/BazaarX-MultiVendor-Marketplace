<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { adminData, type AdminSeller } from "../data";
import { Search, Check, X, Store } from "lucide-vue-next";
import { adminApi, type SellerApplication } from "../services/marketplace";
const query = ref("");
const status = ref("All");
const liveApplications = ref<AdminSeller[] | null>(null);
const loading = ref(false);
const error = ref("");
const sellers = computed(() => {
  const source = liveApplications.value ?? adminData.sellers;
  return source.filter(
    (s) =>
      (status.value === "All" || s.status === status.value) &&
      `${s.name} ${s.location}`
        .toLowerCase()
        .includes(query.value.toLowerCase()),
  );
});
function mapApplication(application: SellerApplication): AdminSeller {
  return { id:application.id,name:application.answers[3] || application.answers[0],location:application.answers[4],submitted:new Date(application.submittedAt).toLocaleDateString(),status:application.status === "PENDING" ? "Pending" : application.status === "APPROVED" ? "Approved" : "Rejected" };
}
async function loadApplications() {
  if (!adminApi.enabled) return;
  loading.value=true;error.value="";
  try { liveApplications.value=(await adminApi.sellerApplications()).data.map(mapApplication); }
  catch(cause) { error.value=cause instanceof Error?cause.message:"Seller applications could not be loaded."; }
  finally { loading.value=false; }
}
onMounted(() => { void loadApplications(); });
async function decide(id: string, status: "Approved" | "Rejected") {
  if (adminApi.enabled && liveApplications.value?.some((seller)=>seller.id===id)) {
    try { await adminApi.decideSellerApplication(id,status.toUpperCase() as "APPROVED"|"REJECTED"); await loadApplications(); }
    catch(cause) { error.value=cause instanceof Error?cause.message:"Application review could not be saved."; }
    return;
  }
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
    <p v-if="loading" role="status">Loading seller applications…</p>
    <p v-if="error" class="admin-error" role="alert">{{ error }}</p>
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
