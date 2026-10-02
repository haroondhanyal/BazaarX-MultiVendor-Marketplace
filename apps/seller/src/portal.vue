<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Search,
  Bell,
  Menu,
  ChevronRight,
  CircleHelp,
  LogOut,
  Store,
} from "lucide-vue-next";
import { sellerData } from "./data";
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Store onboarding", path: "/onboarding", icon: Store },
  { name: "Products", path: "/products", icon: Package },
  { name: "Orders", path: "/orders", icon: ShoppingBag },
  { name: "Inventory", path: "/inventory", icon: Boxes },
];
const title = computed(() =>
  route.path === "/"
    ? "Dashboard"
    : (links.find((item) => item.path === route.path)?.name ??
      (route.path.includes("/products/")
        ? "Product details"
        : route.path.includes("/orders/")
          ? "Order fulfilment"
          : "Seller Center")),
);
function logout() {
  sellerData.loggedIn = false;
  router.push("/login");
}
</script>
<template>
  <div class="portal">
    <aside class="side" :class="{ 'side-open': menuOpen }">
      <RouterLink class="brand" to="/"
        ><img
          src="/assets/branding/bazaarx-logo.svg"
          alt="BazaarX" /></RouterLink
      ><small>SELLER CENTER</small>
      <nav>
        <RouterLink
          v-for="item in links"
          :key="item.path"
          :to="item.path"
          class="side-link"
          :class="{ active: route.path === item.path }"
          ><component :is="item.icon" />{{ item.name }}</RouterLink
        >
      </nav>
      <div class="help">
        <CircleHelp /><b>Need a hand?</b
        ><span>Seller support is here for you.</span><Store /><span
          >Store status: <strong>Active demo</strong></span
        ><button @click="logout"><LogOut /> Sign out</button>
      </div>
    </aside>
    <main>
      <header>
        <button
          class="mobile-menu"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <Menu /></button
        ><label
          ><Search /><input
            aria-label="Search products or orders"
            placeholder="Search products, orders..." /></label
        ><button aria-label="Notifications"><Bell /></button>
        <div class="avatar">S</div>
        <span class="user">Your store<small>Seller account</small></span>
      </header>
      <section class="portal-content">
        <div class="crumb">
          <RouterLink to="/">Seller Center</RouterLink><ChevronRight />{{
            title
          }}
        </div>
        <RouterView />
      </section>
    </main>
  </div>
</template>
