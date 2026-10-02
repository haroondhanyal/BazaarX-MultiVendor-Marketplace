<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  BadgeCheck,
  Sparkles,
  Smartphone,
  Laptop,
  Armchair,
  Shirt,
  Dumbbell,
  Refrigerator,
  Monitor,
  ChevronRight,
} from "lucide-vue-next";
import { categories, products } from "../data/products";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ProductCard from "../components/ProductCard.vue";
const featured = computed(() => products.slice(0, 4));
const categoryIcons = [
  Smartphone,
  Laptop,
  Armchair,
  Shirt,
  Sparkles,
  Dumbbell,
  Refrigerator,
  Monitor,
];
const countdown = ref("08 : 42 : 16");
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main>
      <section class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow"><Sparkles :size="14" /> THE BAZAARX EDIT</span>
          <h1>Find your next<br /><em>favourite thing.</em></h1>
          <p>
            Thoughtful picks, standout value and trusted local stores. All in
            one place.
          </p>
          <div class="hero-actions">
            <RouterLink to="/search" class="button button-primary"
              >Explore the marketplace <ArrowRight :size="17" /></RouterLink
            ><RouterLink to="/flash-sales" class="button button-quiet"
              >See today's deals</RouterLink
            >
          </div>
          <div class="hero-trust">
            <span><ShieldCheck /> Secure checkout</span
            ><span><Truck /> Doorstep delivery</span>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-image">
            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1250&q=90"
              alt="A selection of colourful shopping finds"
            />
            <div class="hero-image-shade"></div>
            <div class="hero-image-text">
              <span>GOOD FINDS,</span><b>great days.</b
              ><RouterLink to="/search"
                >Shop the edit <ArrowRight :size="15"
              /></RouterLink>
            </div>
          </div>
          <div class="hero-note">
            <span class="hero-note-icon"><BadgeCheck /></span>
            <div>
              <strong>Local finds. Big energy.</strong
              ><small>Shop with confidence on BazaarX</small>
            </div>
          </div>
        </div>
      </section>
      <section class="container benefit-row">
        <div>
          <ShieldCheck /><span
            ><b>Secure payments</b><small>Protected checkout</small></span
          >
        </div>
        <div>
          <Truck /><span
            ><b>Delivery you can trust</b
            ><small>Updates every step</small></span
          >
        </div>
        <div>
          <RotateCcw /><span
            ><b>Easy returns</b><small>Simple, clear policies</small></span
          >
        </div>
        <div>
          <BadgeCheck /><span
            ><b>Verified stores</b
            ><small>Quality from local sellers</small></span
          >
        </div>
      </section>
      <section class="section-block container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">A GOOD PLACE TO START</span>
            <h2>Shop by category</h2>
          </div>
          <RouterLink to="/search" class="text-link"
            >Browse everything <ArrowRight :size="16"
          /></RouterLink>
        </div>
        <div class="category-grid">
          <RouterLink
            v-for="(category, index) in categories"
            :key="category.id"
            :to="`/category/${category.slug}`"
            class="category-tile"
            ><span class="category-icon"
              ><component :is="categoryIcons[index]" :size="23" /></span
            ><span>{{ category.name }}</span
            ><ChevronRight class="category-chevron" :size="16"
          /></RouterLink>
        </div>
      </section>
      <section class="flash-band">
        <div class="container flash-inner">
          <div class="flash-title">
            <span class="flash-mark"><Sparkles /></span>
            <div>
              <span class="eyebrow">A LITTLE EXTRA SPECIAL</span>
              <h2>Today’s picks</h2>
            </div>
            <span class="countdown-label"
              >Fresh deals <b>{{ countdown }}</b></span
            >
          </div>
          <RouterLink to="/flash-sales" class="text-link"
            >View all <ArrowRight :size="16"
          /></RouterLink>
        </div>
      </section>
      <section class="container section-block featured-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">HANDPICKED FOR YOU</span>
            <h2>Popular right now</h2>
            <p>Good things shoppers are loving lately.</p>
          </div>
          <RouterLink to="/search" class="text-link"
            >See all products <ArrowRight :size="16"
          /></RouterLink>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in featured"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
      <section class="container seller-banner">
        <div class="seller-banner-icon"><BadgeCheck /></div>
        <div>
          <span class="eyebrow">FOR INDEPENDENT BUSINESSES</span>
          <h2>Your next customer is out there.</h2>
          <p>Bring your store to the BazaarX community.</p>
        </div>
        <RouterLink to="/seller" class="button button-dark"
          >Visit Seller Center <ArrowRight :size="16"
        /></RouterLink>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
