<script setup lang="ts">
import { computed } from "vue";
import { adminData, formatPKR } from "../data";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  ArrowRight,
} from "lucide-vue-next";
const pendingSellers = computed(
  () => adminData.sellers.filter((s) => s.status === "Pending").length,
);
const pendingProducts = computed(
  () => adminData.products.filter((p) => p.status === "Pending").length,
);
</script>
<template>
  <section class="admin-content">
    <div class="admin-heading">
      <div>
        <span class="eyebrow">MARKETPLACE ADMINISTRATION</span>
        <h1>Dashboard</h1>
        <p>Review activity and marketplace operations.</p>
      </div>
    </div>
    <div class="admin-metrics">
      <article>
        <Users /><small>Customers</small><b>58,920</b><span>Demo overview</span>
      </article>
      <article>
        <Store /><small>Active sellers</small
        ><b>{{
          adminData.sellers.filter((s) => s.status === "Approved").length
        }}</b
        ><span>{{ pendingSellers }} awaiting review</span>
      </article>
      <article>
        <Package /><small>Products to review</small><b>{{ pendingProducts }}</b
        ><span>Submission queue</span>
      </article>
      <article>
        <ShoppingBag /><small>Orders</small><b>{{ adminData.orders.length }}</b
        ><span>Mock order records</span>
      </article>
    </div>
    <div class="admin-dashboard-grid">
      <section class="admin-panel">
        <div class="admin-panel-title">
          <div>
            <h2>Seller approval queue</h2>
            <p>Review marketplace seller applications.</p>
          </div>
          <RouterLink to="/sellers">View queue <ArrowRight /></RouterLink>
        </div>
        <div
          v-for="seller in adminData.sellers.filter(
            (s) => s.status === 'Pending',
          )"
          :key="seller.id"
          class="admin-queue-row"
        >
          <span class="admin-queue-avatar"><Store /></span
          ><span
            ><b>{{ seller.name }}</b
            ><small
              >{{ seller.location }} · Submitted {{ seller.submitted }}</small
            ></span
          ><span class="admin-status pending">Pending</span>
        </div>
        <div v-if="!pendingSellers" class="admin-empty">
          Seller queue is clear.
        </div>
      </section>
      <section class="admin-panel">
        <div class="admin-panel-title">
          <div>
            <h2>Marketplace snapshot</h2>
            <p>Latest order totals</p>
          </div>
          <RouterLink to="/orders">See orders <ArrowRight /></RouterLink>
        </div>
        <div class="admin-summary-row">
          <CreditCard /><span
            >Order volume<b
              >PKR
              {{
                formatPKR(adminData.orders.reduce((sum, o) => sum + o.total, 0))
              }}</b
            ></span
          >
        </div>
        <div class="admin-summary-row">
          <Package /><span
            >Product reviews<b
              >{{ pendingProducts }} waiting for review</b
            ></span
          >
        </div>
        <div class="admin-summary-row">
          <Store /><span
            >Seller onboarding<b
              >{{ pendingSellers }} applications need review</b
            ></span
          >
        </div>
      </section>
    </div>
  </section>
</template>
