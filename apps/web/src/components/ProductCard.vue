<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Heart, ShoppingCart, Star, Check, ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { Product } from "@bazaarx/types";
import { useShopStore } from "../stores/shop";
import ImageWithFallback from "./ImageWithFallback.vue";
import { getProductColorFilter } from "../utils/product-image";
const props = defineProps<{ product: Product }>();
const shop = useShopStore();
const added = ref(false);
const imageIndex = ref(0);
const cardImages = computed(() => [...new Set([...(props.product.images ?? []), props.product.image].filter(Boolean))]);
const cardImage = computed(() => cardImages.value[imageIndex.value] ?? props.product.image);
const namedColor = computed(() => {
  const match = props.product.name.match(/graphite|midnight|black|silver|white|pearl|sage|green|red|ocean|blue|navy|pink|rose gold|gold/i)?.[0]?.toLowerCase();
  const aliases: Record<string, string> = { midnight: "midnight black", ocean: "ocean blue" };
  const color = match ? aliases[match] ?? match : props.product.colors?.[0];
  return props.product.colors?.find((value) => value.toLowerCase() === color?.toLowerCase()) ?? "";
});
const cardImageFilter = computed(() => getProductColorFilter(namedColor.value));
watch(() => props.product.id, () => { imageIndex.value = 0; });
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
          :src="cardImage"
          :alt="`${product.name} photo ${imageIndex + 1} of ${cardImages.length}`"
          :style="{ filter: cardImageFilter }" /></RouterLink
      ><div v-if="cardImages.length > 1" class="card-image-controls" aria-label="Product photos">
        <button type="button" aria-label="Previous product photo" @click.prevent.stop="imageIndex = (imageIndex - 1 + cardImages.length) % cardImages.length"><ChevronLeft :size="14" /></button>
        <span>{{ imageIndex + 1 }} / {{ cardImages.length }}</span>
        <button type="button" aria-label="Next product photo" @click.prevent.stop="imageIndex = (imageIndex + 1) % cardImages.length"><ChevronRight :size="14" /></button>
      </div>
      <span v-if="product.badge" class="product-badge" :class="{ 'product-hot-badge': product.badge.includes('Hot selling') }">{{
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
      <div class="product-sales-line">{{ product.soldLast24h ?? 0 }} sold in last 24h <span>· sample data</span></div>
      <div class="price-line">
        <strong>PKR {{ price(product.price) }}</strong
        ><del v-if="product.originalPrice"
          >PKR {{ price(product.originalPrice) }}</del
        >
      </div>
      <div class="product-card-bottom">
        <span class="stock-tag" :class="{ 'low-stock': product.stock < 10 }"><Check :size="12" /> {{ product.stock }} left</span
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
