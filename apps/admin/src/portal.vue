<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  Bell,
  Menu,
  ChevronRight,
  LifeBuoy,
  LogOut,
} from "lucide-vue-next";
import { adminData } from "./data";
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: Users, disabled: true },
  { name: "Sellers", path: "/sellers", icon: Store },
  { name: "Product moderation", path: "/moderation", icon: Package },
  { name: "Orders", path: "/orders", icon: ShoppingBag },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Support", path: "/support", icon: LifeBuoy, disabled: true },
];
const title = computed(
  () =>
    links.find((item) => item.path === route.path)?.name ?? "Marketplace admin",
);
function logout() {
  adminData.loggedIn = false;
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
      ><small>ADMIN PORTAL</small>
      <nav>
        <RouterLink
          v-for="item in links.filter((link) => !link.disabled)"
          :key="item.path"
          :to="item.path"
          class="side-link"
          :class="{ active: route.path === item.path }"
          ><component :is="item.icon" />{{ item.name }}</RouterLink
        ><span
          v-for="item in links.filter((link) => link.disabled)"
          :key="item.name"
          class="side-link disabled-link"
          :aria-label="`${item.name}, planned for a later phase`"
          ><component :is="item.icon" />{{ item.name
          }}<small>Later</small></span
        >
      </nav>
      <div class="help">
        <LifeBuoy /><b>Admin workspace</b
        ><span>Operational actions are stored locally in demo mode.</span
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
            aria-label="Search marketplace data"
            placeholder="Search sellers, products, orders..." /></label
        ><button aria-label="Notifications"><Bell /></button>
        <div class="avatar">A</div>
        <span class="user">Marketplace admin<small>Administrator</small></span>
      </header>
      <section class="portal-content">
        <div class="crumb">
          <RouterLink to="/">Admin Portal</RouterLink><ChevronRight />{{
            title
          }}
        </div>
        <RouterView />
      </section>
    </main>
  </div>
</template>
