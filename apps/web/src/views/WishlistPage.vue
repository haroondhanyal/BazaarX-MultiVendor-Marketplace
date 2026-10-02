<script setup lang="ts">
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ProductCard from "../components/ProductCard.vue";
import StatusView from "../components/StatusView.vue";
const shop = useShopStore();
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span><span>Wishlist</span>
      </div>
      <div class="page-title-row">
        <div>
          <span class="eyebrow">YOUR SAVED FINDS</span>
          <h1>
            Wishlist
            <span class="title-count">{{ shop.savedProducts.length }}</span>
          </h1>
          <p>Keep the things you love close by.</p>
        </div>
        <RouterLink
          v-if="shop.savedProducts.length"
          to="/search"
          class="button button-outline"
          >Continue exploring <ArrowRight :size="16"
        /></RouterLink>
      </div>
      <div v-if="shop.savedProducts.length" class="product-grid">
        <ProductCard
          v-for="product in shop.savedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      <div v-else class="empty-card">
        <StatusView
          mode="empty"
          title="Your wishlist is waiting"
          message="Tap the heart on a product to save it here."
        /><RouterLink to="/search" class="button button-primary"
          >Discover products <ArrowRight :size="16"
        /></RouterLink>
      </div>
      <section v-if="shop.savedProducts.length" class="wishlist-actions">
        <div>
          <Heart /><span
            ><b>A collection of good finds</b
            ><small>Saved just for you on this device.</small></span
          >
        </div>
        <button class="text-button danger-text" @click="shop.wishlist = []">
          <Trash2 :size="15" /> Clear wishlist
        </button>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
