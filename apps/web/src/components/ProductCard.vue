<script setup lang="ts">
import { computed, ref } from "vue";
import { Heart, ShoppingCart, Star, Check } from "lucide-vue-next";
import type { Product } from "@bazaarx/types";
import { useShopStore } from "../stores/shop";
import ImageWithFallback from "./ImageWithFallback.vue";
const props = defineProps<{ product: Product }>();
const shop = useShopStore();
const added = ref(false);
const saved = computed(() => shop.wishlist.includes(props.product.id));
function add() {
  shop.addToCart(props.product.id);
  added.value = true;
  window.setTimeout(() => (added.value = false), 1100);
}
function price(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
</script>

<template>
  <article class="product-card">
    <div class="product-image-wrap">
      <RouterLink :to="`/product/${product.slug}`" class="product-image-link"
        ><ImageWithFallback
          :src="product.image"
          :alt="product.name" /></RouterLink
      ><span v-if="product.badge" class="product-badge" :class="{ 'product-hot-badge': product.badge.includes('Hot selling') }">{{
        product.badge
      }}</span
      ><span v-if="product.originalPrice" class="product-discount-badge">{{
        Math.round((1 - product.price / product.originalPrice) * 100)
      }}% OFF</span
      ><button
        class="favorite-button"
        :class="{ selected: saved }"
        :aria-label="saved ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="shop.toggleWishlist(product.id)"
      >
        <Heart :size="17" :fill="saved ? 'currentColor' : 'none'" />
      </button>
    </div>
    <div class="product-info">
      <RouterLink :to="`/product/${product.slug}`" class="product-title">{{
        product.name
      }}</RouterLink>
      <div class="product-seller">{{ product.seller }}</div>
      <div class="rating-line">
        <Star :size="14" fill="currentColor" /><b>{{ product.rating }}</b
        ><span>({{ product.reviews.toLocaleString() }})</span>
      </div>
      <div class="price-line">
        <strong>PKR {{ price(product.price) }}</strong
        ><del v-if="product.originalPrice"
          >PKR {{ price(product.originalPrice) }}</del
        >
      </div>
      <div class="product-card-bottom">
        <span class="stock-tag"><Check :size="12" /> In stock</span
        ><button
          class="card-add"
          :aria-label="`Add ${product.name} to cart`"
          @click="add"
        >
          <Check v-if="added" :size="15" /><ShoppingCart
            v-else
            :size="15"
          /><span>{{ added ? "Added" : "Add" }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
