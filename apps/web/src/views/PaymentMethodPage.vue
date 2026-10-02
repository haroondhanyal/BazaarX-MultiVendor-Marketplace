<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Wallet,
  ShieldCheck,
  Smartphone,
  Check,
} from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
const shop = useShopStore();
const router = useRouter();
const methods = [
  {
    id: "cod",
    name: "Cash on delivery",
    detail: "Pay when your order arrives",
    icon: Banknote,
  },
  {
    id: "card",
    name: "Credit or debit card",
    detail: "Visa, Mastercard and local cards",
    icon: CreditCard,
  },
  {
    id: "wallet",
    name: "BazaarX Wallet",
    detail: "Demo wallet balance: PKR 15,000",
    icon: Wallet,
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    detail: "Secure mobile wallet (mock)",
    icon: Smartphone,
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    detail: "Secure mobile wallet (mock)",
    icon: Smartphone,
  },
  {
    id: "installments",
    name: "Installments",
    detail: "Pay in monthly installments (mock)",
    icon: CreditCard,
  },
];
function continuePayment() {
  if (shop.selectedPayment === "card") router.push("/payment/card");
  else router.push("/checkout");
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page payment-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><RouterLink to="/checkout">Checkout</RouterLink><span>/</span
        ><span>Payment method</span>
      </div>
      <RouterLink to="/checkout" class="text-link"
        ><ArrowLeft /> Back to checkout</RouterLink
      >
      <div class="page-title-row payment-title">
        <div>
          <span class="eyebrow">HOW WOULD YOU LIKE TO PAY?</span>
          <h1>Choose a payment method</h1>
          <p>Select the option that works best for you.</p>
        </div>
        <ShieldCheck class="payment-shield" />
      </div>
      <div class="payment-options">
        <label
          v-for="method in methods"
          :key="method.id"
          class="payment-option"
          :class="{ selected: shop.selectedPayment === method.id }"
          ><input
            v-model="shop.selectedPayment"
            type="radio"
            name="payment"
            :value="method.id" /><span class="payment-icon"
            ><component :is="method.icon" /></span
          ><span class="payment-copy"
            ><b>{{ method.name }}</b
            ><small>{{ method.detail }}</small></span
          ><Check
            v-if="shop.selectedPayment === method.id"
            class="payment-check"
        /></label>
      </div>
      <div class="payment-actions">
        <span
          ><ShieldCheck /> Payments are simulated in this development
          phase.</span
        ><button class="button button-primary" @click="continuePayment">
          Continue <ArrowLeft class="arrow-forward" />
        </button>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
