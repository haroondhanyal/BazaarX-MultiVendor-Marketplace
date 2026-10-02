<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Minus,
  Plus,
  Trash2,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import StatusView from "../components/StatusView.vue";
const shop = useShopStore();
const router = useRouter();
const delivery = computed(() => (shop.cartTotal >= 25000 ? 0 : 350));
const total = computed(() => shop.cartTotal + delivery.value);
function money(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><span>Shopping cart</span>
      </div>
      <div class="page-title-row">
        <div>
          <span class="eyebrow">ALMOST YOURS</span>
          <h1>
            Shopping cart <span class="title-count">{{ shop.cartCount }}</span>
          </h1>
          <p>Review your finds before checkout.</p>
        </div>
        <RouterLink to="/search" class="text-link"
          >Keep exploring <ArrowRight :size="16"
        /></RouterLink>
      </div>
      <div v-if="shop.cartProducts.length" class="cart-layout">
        <section class="cart-items">
          <div class="cart-seller-heading">
            <span class="store-avatar">BX</span
            ><span
              ><b>BazaarX stores</b
              ><small>Items from trusted independent sellers</small></span
            ><span class="seller-secure"
              ><ShieldCheck :size="15" /> Secure order</span
            >
          </div>
          <article
            v-for="line in shop.cartProducts"
            :key="line.product.id"
            class="cart-item"
          >
            <RouterLink
              :to="`/product/${line.product.slug}`"
              class="cart-item-image"
              ><img :src="line.product.image" :alt="line.product.name"
            /></RouterLink>
            <div class="cart-item-info">
              <span class="eyebrow">{{ line.product.seller }}</span
              ><RouterLink
                :to="`/product/${line.product.slug}`"
                class="cart-product-name"
                >{{ line.product.name }}</RouterLink
              ><span class="cart-stock">In stock · Ready to ship</span>
              <div class="cart-mobile-bottom">
                <div class="quantity-control">
                  <button
                    aria-label="Decrease quantity"
                    @click="
                      shop.setQuantity(line.product.id, line.quantity - 1)
                    "
                  >
                    <Minus :size="14" /></button
                  ><span>{{ line.quantity }}</span
                  ><button
                    aria-label="Increase quantity"
                    :disabled="line.quantity >= line.product.stock"
                    @click="
                      shop.setQuantity(line.product.id, line.quantity + 1)
                    "
                  >
                    <Plus :size="14" />
                  </button>
                </div>
                <b>PKR {{ money(line.product.price * line.quantity) }}</b
                ><button
                  class="remove-button"
                  :aria-label="`Remove ${line.product.name}`"
                  @click="shop.setQuantity(line.product.id, 0)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </article>
          <div class="shipping-progress">
            <Truck :size="19" />
            <div>
              <b>{{
                shop.cartTotal >= 25000
                  ? "You unlocked free delivery"
                  : `Add PKR ${money(25000 - shop.cartTotal)} for free delivery`
              }}</b
              ><small>Free standard delivery on orders over PKR 25,000</small>
              <div class="progress-track">
                <span
                  :style="{
                    width: `${Math.min((shop.cartTotal / 25000) * 100, 100)}%`,
                  }"
                />
              </div>
            </div>
          </div>
        </section>
        <aside class="order-summary">
          <h2>Order summary</h2>
          <div class="summary-row">
            <span>Items ({{ shop.cartCount }})</span
            ><b>PKR {{ money(shop.cartTotal) }}</b>
          </div>
          <div class="summary-row">
            <span>Delivery</span
            ><b>{{ delivery === 0 ? "FREE" : `PKR ${money(delivery)}` }}</b>
          </div>
          <div class="summary-divider" />
          <div class="summary-row summary-total">
            <span>Total</span><b>PKR {{ money(total) }}</b>
          </div>
          <button
            class="button button-primary checkout-button"
            @click="
              router.push(shop.user ? '/checkout' : '/login?next=/checkout')
            "
          >
            Continue to checkout <ArrowRight :size="16" />
          </button>
          <p class="secure-note">
            <ShieldCheck :size="14" /> Secure checkout, every time
          </p>
          <RouterLink to="/search" class="continue-shopping"
            ><ShoppingBag :size="16" /> Continue shopping</RouterLink
          >
        </aside>
      </div>
      <div v-else class="empty-card">
        <StatusView
          mode="empty"
          title="Your cart is taking a little break"
          message="Browse the marketplace and add something you love."
        /><RouterLink to="/search" class="button button-primary"
          >Start exploring <ArrowRight :size="16"
        /></RouterLink>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
