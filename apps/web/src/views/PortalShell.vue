<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  ChartNoAxesCombined,
  Settings,
  Store,
  Users,
  CreditCard,
  Truck,
  RotateCcw,
  Tags,
  LifeBuoy,
  ShieldCheck,
  Search,
  Bell,
  Menu,
} from "lucide-vue-next";
const route = useRoute();
const isAdmin = computed(() => route.path.startsWith("/admin"));
const portalBase = computed(() => isAdmin.value
  ? import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5175"
  : import.meta.env.VITE_SELLER_PORTAL_URL || "http://localhost:5174");
function portalUrl(name: string) {
  const adminRoutes: Record<string,string> = { Users:"users",Sellers:"sellers",Products:"moderation",Orders:"orders",Payments:"payments",Shipments:"shipments",Returns:"returns",Promotions:"promotions",Support:"support","Fraud & risk":"fraud",Settings:"settings" };
  const sellerRoutes: Record<string,string> = { Products:"products",Orders:"orders",Inventory:"inventory",Marketing:"promotions",Finance:"finance",Analytics:"analytics","Store settings":"store" };
  const path = (isAdmin.value ? adminRoutes : sellerRoutes)[name];
  return `${portalBase.value}${path ? `/${path}` : "/"}`;
}
const sellerLinks = [
  ["Dashboard", LayoutDashboard],
  ["Products", Package],
  ["Orders", ShoppingBag],
  ["Inventory", Boxes],
  ["Marketing", Tags],
  ["Finance", CreditCard],
  ["Analytics", ChartNoAxesCombined],
  ["Store settings", Settings],
] as const;
const adminLinks = [
  ["Dashboard", LayoutDashboard],
  ["Users", Users],
  ["Sellers", Store],
  ["Products", Package],
  ["Orders", ShoppingBag],
  ["Payments", CreditCard],
  ["Shipments", Truck],
  ["Returns", RotateCcw],
  ["Promotions", Tags],
  ["Support", LifeBuoy],
  ["Fraud & risk", ShieldCheck],
  ["Settings", Settings],
] as const;
const links = computed(() => (isAdmin.value ? adminLinks : sellerLinks));
const heading = computed(
  () => route.params.pathMatch?.[0]?.replaceAll("-", " ") || "Dashboard",
);
</script>
<template>
  <div class="portal-shell">
    <aside class="portal-sidebar">
      <RouterLink to="/" class="brand"
        ><span class="brand-mark"
          ><span></span><span></span><span></span><span></span></span
        ><span>Bazaar<span class="brand-x">X</span></span></RouterLink
      >
      <p class="portal-kicker">
        {{ isAdmin ? "ADMIN PORTAL" : "SELLER CENTER" }}
      </p>
      <nav>
        <a
          v-for="([name, icon], index) in links"
          :key="name"
          :href="portalUrl(name)"
          class="portal-nav"
          :class="{ active: index === 0 && !route.params.pathMatch?.[0] }"
          ><component :is="icon" /><span>{{ name }}</span></a
        >
      </nav>
      <div class="portal-help">
        <ShieldCheck /><b>{{
          isAdmin ? "Secure admin access" : "Grow your store"
        }}</b
        ><small>{{
          isAdmin
            ? "Marketplace management portal"
            : "Your BazaarX seller workspace"
        }}</small>
      </div>
    </aside>
    <main class="portal-content">
      <header class="portal-header">
        <button class="icon-button" aria-label="Open sidebar"><Menu /></button
        ><label class="portal-search"
          ><Search /><input
            :placeholder="
              isAdmin
                ? 'Search users, orders, products...'
                : 'Search products, orders...'
            "
            aria-label="Search portal" /></label
        ><button class="icon-button" aria-label="Notifications">
          <Bell />
        </button>
        <div class="portal-user">
          <span>{{ isAdmin ? "A" : "S" }}</span>
          <div>
            <b>{{ isAdmin ? "Admin" : "Store owner" }}</b
            ><small>{{ isAdmin ? "Administrator" : "BazaarX seller" }}</small>
          </div>
        </div>
      </header>
      <section class="portal-body">
        <div class="breadcrumb">
          <RouterLink to="/">BazaarX</RouterLink><span>/</span
          ><span>{{ isAdmin ? "Admin" : "Seller Center" }}</span
          ><span>/</span><span>{{ heading }}</span>
        </div>
        <span class="eyebrow">{{
          isAdmin ? "MARKETPLACE ADMINISTRATION" : "YOUR BUSINESS AT A GLANCE"
        }}</span>
        <h1>{{ heading.charAt(0).toUpperCase() + heading.slice(1) }}</h1>
        <p class="portal-description">
          {{
            isAdmin
              ? "Manage the BazaarX marketplace from one workspace."
              : "Everything you need to manage your BazaarX store."
          }}
        </p>
        <div class="portal-welcome">
          <div class="portal-welcome-icon">
            <component :is="isAdmin ? ShieldCheck : Store" />
          </div>
          <div>
            <h2>
              {{
                isAdmin
                  ? "Welcome to the admin portal"
                  : "Welcome to Seller Center"
              }}
            </h2>
            <p>The full {{ isAdmin ? "admin portal" : "seller center" }} runs as a separate app.</p>
          </div>
          <a class="badge badge-neutral" :href="portalBase">Open portal</a>
        </div>
        <div class="portal-empty">
          <Boxes /><b>Continue in {{ isAdmin ? "Admin Portal" : "Seller Center" }}</b>
          <p>Open the dedicated app to manage {{ heading.toLowerCase() }}.</p>
          <a :href="portalUrl(heading)">Go to {{ heading }}</a>
        </div>
      </section>
    </main>
  </div>
</template>
