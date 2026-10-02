<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  Minus,
  Plus,
  ChevronRight,
  Store,
} from "lucide-vue-next";
import { products } from "../data/products";
import type { Product } from "@bazaarx/types";
import { useShopStore } from "../stores/shop";
import { catalogApi } from "../services/catalog";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ProductCard from "../components/ProductCard.vue";
import ImageWithFallback from "../components/ImageWithFallback.vue";
import StatusView from "../components/StatusView.vue";
import { intelligenceApi } from "../services/intelligence";
import { getDemoReviews } from "../data/demoReviews";
const route = useRoute();
const router = useRouter();
const shop = useShopStore();
const product = ref<Product | undefined>();
const loading = ref(true);
const loadError = ref(false);
const quantity = ref(1);
const selectedColor = ref("");
const tab = ref("description");
const added = ref(false);
const aiReview = ref<{summary:string;positives:string[];complaints:string[];sentiment:string} | null>(null);
const aiRecommendations = ref<Product[]>([]);
const visibleCount = ref(4);
const visibleReviews = ref(3);
const demoReviews = computed(() => product.value ? getDemoReviews(product.value) : []);
const similar = computed(() =>
  products
    .filter(
      (item) =>
        item.id !== product.value?.id &&
        item.category === product.value?.category,
    )
);
const recommended = computed(() => aiRecommendations.value.length ? aiRecommendations.value : similar.value);
const visibleRecommended = computed(() => recommended.value.slice(0, visibleCount.value));
async function loadProduct() {
  visibleCount.value = 4;
  visibleReviews.value = 3;
  loading.value = true;
  loadError.value = false;
  try {
    const loadedProduct = await catalogApi.getProduct(String(route.params.slug));
    if (!loadedProduct) throw new Error("Product not found");
    product.value = loadedProduct;
    if (intelligenceApi.enabled) {
      const [review, recommendations] = await Promise.all([intelligenceApi.reviewSummary(loadedProduct.id), intelligenceApi.recommendations(loadedProduct.id)]);
      aiReview.value = review;
      aiRecommendations.value = recommendations.data;
    }
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(loadProduct);
watch(() => route.params.slug, loadProduct);
function price(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
function addCart(goToCart = false) {
  if (!product.value) return;
  for (let i = 0; i < quantity.value; i++) shop.addToCart(product.value.id);
  if (goToCart) router.push("/cart");
  else {
    added.value = true;
    window.setTimeout(() => (added.value = false), 1200);
  }
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main v-if="loading || loadError" class="container product-page">
      <StatusView
        v-if="loading"
        mode="loading"
        title="Loading product details"
      />
      <StatusView
        v-else
        mode="error"
        title="Product details unavailable"
        message="Please try loading this product again."
        @retry="loadProduct"
      />
    </main>
    <main v-else-if="product" class="container product-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><ChevronRight /><RouterLink
          to="/search"
          >{{ product.category }}</RouterLink
        ><ChevronRight /><span>{{ product.name }}</span>
      </div>
      <section class="product-detail-grid">
        <div class="gallery">
          <div class="gallery-main">
            <ImageWithFallback :src="product.image" :alt="product.name" /><span
              v-if="product.badge"
              class="product-badge"
              >{{ product.badge }}</span
            >
          </div>
          <div class="gallery-thumbs">
            <button
              class="thumb active"
              :aria-label="`${product.name} image 1`"
            >
              <ImageWithFallback
                :src="product.image"
                :alt="product.name"
              /></button
            ><button
              class="thumb"
              :aria-label="`${product.name} alternate view`"
            >
              <ImageWithFallback
                :src="product.image"
                :alt="product.name"
              /></button
            ><button class="thumb-placeholder" aria-label="More product photos">
              +3
            </button>
          </div>
        </div>
        <div class="product-details">
          <div class="eyebrow">
            {{ product.brand }} · {{ product.category }}
          </div>
          <h1>{{ product.name }}</h1>
          <div class="detail-rating">
            <span class="rating-star"
              ><Star :size="15" fill="currentColor" />
              {{ product.rating }}</span
            ><a href="#reviews"
              >{{ product.reviews.toLocaleString() }} reviews</a
            ><span class="sold-label">· Popular choice</span>
          </div>
          <div class="detail-price">
            <strong>PKR {{ price(product.price) }}</strong
            ><del v-if="product.originalPrice"
              >PKR {{ price(product.originalPrice) }}</del
            ><span v-if="product.originalPrice" class="discount-chip"
              >{{
                Math.round((1 - product.price / product.originalPrice) * 100)
              }}% off</span
            >
          </div>
          <p class="tax-note">Inclusive of applicable taxes</p>
          <div v-if="product.colors?.length" class="option-block">
            <b
              >Color <span>{{ selectedColor || product.colors[0] }}</span></b
            >
            <div class="swatches">
              <button
                v-for="color in product.colors"
                :key="color"
                :class="{
                  active:
                    selectedColor === color ||
                    (!selectedColor && color === product.colors?.[0]),
                }"
                :aria-label="color"
                :title="color"
                @click="selectedColor = color"
              >
                <i />
              </button>
            </div>
          </div>
          <div class="availability">
            <Check :size="16" /><b>{{
              product.stock < 10 ? "Only a few left" : "In stock"
            }}</b
            ><span>· Ships from {{ product.seller }}</span>
          </div>
          <div class="quantity-row">
            <b>Quantity</b>
            <div class="quantity-control">
              <button
                aria-label="Decrease quantity"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <Minus :size="14" /></button
              ><span>{{ quantity }}</span
              ><button
                aria-label="Increase quantity"
                :disabled="quantity >= product.stock"
                @click="quantity = Math.min(product.stock, quantity + 1)"
              >
                <Plus :size="14" />
              </button>
            </div>
            <span class="stock-hint">{{ product.stock }} available</span>
          </div>
          <div class="buy-actions">
            <button
              class="button button-primary add-cart-button"
              @click="addCart()"
            >
              <Check v-if="added" /><ShoppingCart v-else />
              {{ added ? "Added to cart" : "Add to cart" }}</button
            ><button class="button button-dark" @click="addCart(true)">
              Buy now</button
            ><button
              class="icon-button save-button"
              :class="{ selected: shop.wishlist.includes(product.id) }"
              :aria-label="
                shop.wishlist.includes(product.id)
                  ? 'Remove from wishlist'
                  : 'Save to wishlist'
              "
              @click="shop.toggleWishlist(product.id)"
            >
              <Heart
                :fill="
                  shop.wishlist.includes(product.id) ? 'currentColor' : 'none'
                "
              />
            </button>
          </div>
          <div class="assurance-list">
            <div>
              <Truck /><span
                ><b>Reliable delivery</b
                ><small>Track your order from dispatch</small></span
              >
            </div>
            <div>
              <RotateCcw /><span
                ><b>Easy returns</b
                ><small>Check the store's return policy</small></span
              >
            </div>
            <div>
              <ShieldCheck /><span
                ><b>Secure payments</b
                ><small>Your payment details stay protected</small></span
              >
            </div>
          </div>
          <div class="seller-card">
            <span class="seller-avatar"><Store /></span>
            <div>
              <small>Sold by</small><b>{{ product.seller }}</b
              ><span class="seller-verified"
                ><Check :size="12" /> Verified store</span
              >
            </div>
            <RouterLink to="/search" class="button button-outline"
              >Visit store</RouterLink
            >
          </div>
        </div>
      </section>
      <section class="product-extra">
        <div class="tabs">
          <button
            :class="{ active: tab === 'description' }"
            @click="tab = 'description'"
          >
            Description</button
          ><button
            :class="{ active: tab === 'specifications' }"
            @click="tab = 'specifications'"
          >
            Specifications</button
          ><button
            id="reviews"
            :class="{ active: tab === 'reviews' }"
            @click="tab = 'reviews'"
          >
            Reviews ({{ product.reviews.toLocaleString() }})
          </button>
        </div>
        <div v-if="tab === 'description'" class="tab-content">
          <h2>About this product</h2>
          <p>{{ product.description }}</p>
          <p>
            Carefully selected by {{ product.seller }} and backed by BazaarX's
            trusted marketplace standards.
          </p>
        </div>
        <div v-else-if="tab === 'specifications'" class="tab-content">
          <h2>Product specifications</h2>
          <dl class="spec-list">
            <template v-for="(value, key) in product.specifications" :key="key"
              ><dt>{{ key }}</dt>
              <dd>{{ value }}</dd></template
            >
            <dt>Brand</dt>
            <dd>{{ product.brand }}</dd>
            <dt>Category</dt>
            <dd>{{ product.category }}</dd>
          </dl>
        </div>
        <div v-else class="tab-content review-summary">
          <span class="rating-large"
            ><Star fill="currentColor" /> {{ product.rating
            }}<small>out of 5</small></span
          >
          <div>
            <h2>Shopper reviews</h2>
            <p>{{ aiReview?.summary ?? `${product.reviews.toLocaleString()} shopper ratings. Review summary is available when the smart API is connected.` }}</p>
            <div v-if="aiReview" class="ai-review-points"><b>Common positives</b><span v-for="item in aiReview.positives" :key="item">{{ item }}</span><b>To consider</b><span v-for="item in aiReview.complaints" :key="item">{{ item }}</span><small>Sentiment: {{ aiReview.sentiment }} · Demo review summary</small></div>
            <span class="verified-review"
              ><ShieldCheck :size="16" /> Verified buyer reviews are linked to BazaarX
              orders.</span
            >
            <section class="demo-review-list" aria-label="Sample shopper reviews">
              <div class="demo-review-heading">
                <h3>Customer photos & videos</h3>
                <span>Demo sample reviews</span>
              </div>
              <article v-for="review in demoReviews.slice(0, visibleReviews)" :key="review.id" class="demo-review-card">
                <img class="demo-review-avatar" :src="review.avatar" :alt="`${review.gender} sample reviewer`" loading="lazy" />
                <div class="demo-review-content">
                  <div class="demo-review-meta"><b>{{ review.name }}</b><span>{{ review.date }}</span></div>
                  <div class="demo-review-stars" :aria-label="`${review.rating} out of 5 stars`"><Star v-for="star in 5" :key="star" :size="13" :fill="star <= review.rating ? 'currentColor' : 'none'" /></div>
                  <p>{{ review.comment }}</p>
                  <div v-if="review.image || review.video" class="demo-review-media">
                    <img v-if="review.image" :src="review.image" :alt="`Sample customer photo of ${product?.name}`" loading="lazy" />
                    <video v-if="review.video" controls preload="none" :poster="product?.image" aria-label="Sample demo review video"><source :src="review.video" type="video/mp4" />Video playback is not supported in this browser.</video>
                  </div>
                  <small class="demo-review-note">Illustrative demo content · not a verified buyer review</small>
                </div>
              </article>
              <button v-if="visibleReviews < demoReviews.length" class="load-more-button" @click="visibleReviews = Math.min(visibleReviews + 3, demoReviews.length)">Load more sample reviews ({{ demoReviews.length - visibleReviews }} left)</button>
            </section>
          </div>
        </div>
      </section>
      <section v-if="recommended.length" class="section-block related-products">
        <div class="section-heading">
          <div>
            <span class="eyebrow">MORE TO EXPLORE</span>
            <h2>You might also like</h2>
          </div>
        </div>
        <div class="product-grid">
          <ProductCard v-for="item in visibleRecommended" :key="item.id" :product="item" />
        </div>
        <button v-if="visibleCount < recommended.length" class="load-more-button" @click="visibleCount = Math.min(visibleCount + 4, recommended.length)">Load more similar products ({{ recommended.length - visibleCount }} left)</button>
      </section>
    </main>
    <main v-else class="container">
      <div class="not-found">
        <h1>We couldn't find that product</h1>
        <p>It may have moved or is no longer available.</p>
        <RouterLink to="/search" class="button button-primary"
          >Browse products</RouterLink
        >
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
