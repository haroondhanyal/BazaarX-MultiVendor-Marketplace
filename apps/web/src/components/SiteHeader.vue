<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Heart,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  Store,
  Sparkles,
} from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
const shop = useShopStore();
const router = useRouter();
const term = ref("");
const menuOpen = ref(false);
const sellerPortalUrl = import.meta.env.VITE_SELLER_PORTAL_URL || "http://localhost:5174";
const adminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5175";
function search() {
  router.push({ path: "/search", query: term.value ? { q: term.value } : {} });
}
</script>

<template>
  <div class="top-strip">
    <div class="container top-strip-inner">
      <span>Shop smarter. Live better.</span>
      <div>
        <a :href="sellerPortalUrl">Sell on BazaarX</a><span class="top-separator">·</span
        ><a :href="adminPortalUrl">Marketplace admin</a>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container header-main">
      <button
        class="icon-button mobile-menu"
        aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen"
      >
        <Menu v-if="!menuOpen" /><X v-else />
      </button>
      <RouterLink to="/" class="brand" aria-label="BazaarX home">
        <img
          class="brand-image"
          src="/assets/branding/bazaarx-logo.png"
          alt="BazaarX"
        />
      </RouterLink>
      <form class="search-box" role="search" @submit.prevent="search">
        <Search :size="18" /><input
          v-model="term"
          aria-label="Search products"
          placeholder="Search products, brands and more..."
        /><button type="submit">Search</button>
      </form>
      <nav class="header-actions" aria-label="Quick links">
        <RouterLink to="/wishlist" class="header-link"
          ><span class="header-icon"
            ><Heart /><i v-if="shop.wishlist.length" class="count-dot">{{
              shop.wishlist.length
            }}</i></span
          ><span class="action-label">Wishlist</span></RouterLink
        >
        <RouterLink :to="shop.user ? '/account' : '/login'" class="header-link"
          ><span class="header-icon"><UserRound /></span
          ><span class="action-label">{{
            shop.user?.name?.split(" ")[0] ?? "Account"
          }}</span></RouterLink
        >
        <RouterLink to="/cart" class="header-link"
          ><span class="header-icon"
            ><ShoppingCart /><i v-if="shop.cartCount" class="count-dot">{{
              shop.cartCount
            }}</i></span
          ><span class="action-label">Cart</span></RouterLink
        >
      </nav>
    </div>
    <div class="category-nav" :class="{ 'category-nav-open': menuOpen }">
      <div class="container category-nav-inner">
        <RouterLink to="/search" class="all-categories"
          ><Menu :size="16" /> All Categories</RouterLink
        ><RouterLink to="/search?q=deals">Today's Deals</RouterLink
        ><RouterLink to="/search?q=flash+sale">Flash Sale</RouterLink
        ><RouterLink to="/search?sort=newest">New Arrivals</RouterLink
        ><RouterLink to="/search?q=brands">Top Brands</RouterLink
        ><RouterLink to="/search?q=local+stores">BazaarX Local</RouterLink
        ><RouterLink to="/assistant"><Sparkles :size="14" /> Smart shopping</RouterLink
        ><span class="nav-promise"
          ><Store :size="14" /> Trusted local stores</span
        >
      </div>
    </div>
  </header>
</template>
