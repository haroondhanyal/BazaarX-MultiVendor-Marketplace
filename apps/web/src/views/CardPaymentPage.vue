<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
const shop = useShopStore();
const router = useRouter();
const holder = ref("");
const number = ref("");
const expiry = ref("");
const cvv = ref("");
const error = ref("");
function submit() {
  error.value = "";
  if (
    holder.value.trim().length < 2 ||
    number.value.replace(/\D/g, "").length < 12 ||
    !/^\d{2}\/\d{2}$/.test(expiry.value) ||
    cvv.value.replace(/\D/g, "").length < 3
  ) {
    error.value = "Check the card details and try again.";
    return;
  }
  shop.selectedPayment = "card";
  router.push("/checkout");
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page card-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><RouterLink to="/payment">Payment method</RouterLink><span>/</span
        ><span>Card payment</span>
      </div>
      <RouterLink to="/payment" class="text-link"
        ><ArrowLeft /> Change payment method</RouterLink
      >
      <div class="card-payment-layout">
        <section class="card-form-panel">
          <span class="eyebrow">SECURE CARD PAYMENT</span>
          <h1>Enter card details</h1>
          <p>Your payment is simulated; no card data is saved.</p>
          <div class="card-preview">
            <span><CreditCard /> BazaarX</span><b>•••• •••• •••• ••••</b
            ><small
              >{{ holder || "CARDHOLDER NAME" }}
              <span>{{ expiry || "MM/YY" }}</span></small
            >
          </div>
          <form @submit.prevent="submit">
            <label class="form-field"
              ><span>Name on card</span
              ><input
                v-model="holder"
                class="plain-input"
                autocomplete="cc-name"
                placeholder="As shown on card"
                required /></label
            ><label class="form-field"
              ><span>Card number</span
              ><input
                v-model="number"
                class="plain-input"
                inputmode="numeric"
                autocomplete="cc-number"
                maxlength="23"
                placeholder="1234 5678 9012 3456"
                required
            /></label>
            <div class="card-field-row">
              <label class="form-field"
                ><span>Expiry date</span
                ><input
                  v-model="expiry"
                  class="plain-input"
                  autocomplete="cc-exp"
                  placeholder="MM/YY"
                  required /></label
              ><label class="form-field"
                ><span>Security code</span
                ><input
                  v-model="cvv"
                  class="plain-input"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  maxlength="4"
                  placeholder="CVV"
                  required
              /></label>
            </div>
            <div v-if="error" class="form-alert" role="alert">{{ error }}</div>
            <button class="button button-primary card-submit">
              <LockKeyhole /> Continue securely
            </button>
          </form>
        </section>
        <aside class="card-security">
          <ShieldCheck />
          <h2>Protected payment</h2>
          <p>
            This demo never sends card details to a payment provider or stores
            them in the browser.
          </p>
        </aside>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
