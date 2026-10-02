<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Check, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-vue-next";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import StatusView from "../components/StatusView.vue";
import { orderApi } from "../services/orders";
import { commerceApi } from "../services/commerce";

const shop = useShopStore();
const router = useRouter();
const savedAddresses = ref<string[]>(
  JSON.parse(localStorage.getItem("bx-addresses") ?? "[]") as string[],
);
const address = ref(shop.checkoutAddress || savedAddresses.value[0] || "");
const error = ref("");
const placing = ref(false);
const voucherCode = ref(shop.voucherCode);
const voucherMessage = ref("");
const deliveryFee = computed(() =>
  shop.deliveryMethod === "express" ? 800 : shop.cartTotal >= 25000 ? 0 : 350,
);
const total = computed(() =>
  Math.max(0, shop.cartTotal + deliveryFee.value - shop.voucherDiscount),
);
async function applyVoucher() {
  voucherMessage.value = "";
  if (commerceApi.enabled) {
    try {
      const result = await commerceApi.validateVoucher({
        code: voucherCode.value,
        subtotal: shop.cartTotal,
        productIds: shop.cartProducts.map((line) => line.product.id),
      });
      shop.voucherDiscount = result.discount;
      shop.voucherCode = result.code;
      voucherMessage.value = `${result.title} applied — PKR ${money(result.discount)} off.`;
    } catch (cause) {
      shop.voucherDiscount = 0;
      shop.voucherCode = "";
      voucherMessage.value = cause instanceof Error ? cause.message : "That voucher code is not valid.";
    }
    return;
  }
  if (voucherCode.value.trim().toUpperCase() !== "BAZAARX10") {
    shop.voucherDiscount = 0;
    shop.voucherCode = "";
    voucherMessage.value = "That voucher code is not valid.";
    return;
  }
  if (shop.cartTotal < 10000) {
    shop.voucherDiscount = 0;
    voucherMessage.value = "This voucher needs a PKR 10,000 minimum order.";
    return;
  }
  shop.voucherDiscount = Math.min(Math.round(shop.cartTotal * 0.1), 5000);
  shop.voucherCode = "BAZAARX10";
  voucherMessage.value = `Voucher applied — PKR ${money(shop.voucherDiscount)} off.`;
}
function money(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
async function placeOrder() {
  error.value = "";
  if (!address.value.trim()) {
    error.value = "Add a delivery address to continue.";
    return;
  }
  if (!shop.cartProducts.length) {
    router.push("/cart");
    return;
  }
  shop.checkoutAddress = address.value.trim();
  placing.value = true;
  try {
    let order;
    if (orderApi.enabled) {
      order = await orderApi.checkout({
        items: shop.cartProducts.map(({ product, quantity, flashSaleId }) => ({
          productId: product.id,
          quantity,
          flashSaleId,
        })),
        address: shop.checkoutAddress,
        paymentMethod: shop.selectedPayment,
        deliveryMethod: shop.deliveryMethod,
        voucherCode: shop.voucherDiscount ? shop.voucherCode : undefined,
      });
      if (shop.selectedPayment !== "cod") {
        const payment = await orderApi.createPayment(order.id, shop.selectedPayment);
        if (payment.status !== "AUTHORIZED")
          throw new Error("The payment was not authorized. Please try again.");
        order.status = "PLACED";
      }
      shop.saveOrder(order);
    } else {
      order = shop.createOrder();
    }
    if (order)
      router.push({ path: "/payment/success", query: { orderId: order.id } });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Could not place your order.";
  } finally {
    placing.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><RouterLink to="/cart">Cart</RouterLink><span>/</span
        ><span>Checkout</span>
      </div>
      <div class="page-title-row">
        <div>
          <span class="eyebrow">SECURE CHECKOUT</span>
          <h1>Complete your order</h1>
          <p>Confirm delivery and payment details.</p>
        </div>
        <span class="checkout-secure"><ShieldCheck /> Protected checkout</span>
      </div>
      <div v-if="shop.cartProducts.length" class="checkout-layout">
        <section class="checkout-main">
          <div class="checkout-step">
            <span class="step-number"><MapPin /></span>
            <div class="checkout-section-head">
              <div>
                <h2>Delivery address</h2>
                <p>Where should we deliver your order?</p>
              </div>
              <RouterLink to="/account/addresses" class="text-link"
                >Manage addresses</RouterLink
              >
            </div>
          </div>
          <div v-if="savedAddresses.length" class="saved-address-options">
            <label
              v-for="saved in savedAddresses"
              :key="saved"
              class="address-option"
              :class="{ selected: address === saved }"
              ><input
                v-model="address"
                type="radio"
                :value="saved"
                name="address" /><MapPin /><span>{{ saved }}</span
              ><Check v-if="address === saved"
            /></label>
          </div>
          <label class="form-field checkout-address"
            ><span>{{
              savedAddresses.length
                ? "Or enter a different address"
                : "Delivery address"
            }}</span
            ><textarea
              v-model="address"
              class="plain-input"
              rows="3"
              placeholder="House, street, area and city"
              required
            />
          </label>
          <div class="checkout-step">
            <span class="step-number"><Truck /></span>
            <div class="checkout-section-head">
              <div>
                <h2>Delivery method</h2>
                <p>Choose how quickly your order should arrive.</p>
              </div>
            </div>
          </div>
          <div class="delivery-options">
            <label
              class="delivery-option"
              :class="{ selected: shop.deliveryMethod === 'standard' }"
              ><input
                v-model="shop.deliveryMethod"
                type="radio"
                value="standard"
              /><span
                ><b>Standard delivery</b><small>3–5 business days</small></span
              ><strong>{{
                shop.cartTotal >= 25000 ? "FREE" : "PKR 350"
              }}</strong></label
            ><label
              class="delivery-option"
              :class="{ selected: shop.deliveryMethod === 'express' }"
              ><input
                v-model="shop.deliveryMethod"
                type="radio"
                value="express"
              /><span
                ><b>Express delivery</b><small>1–2 business days</small></span
              ><strong>PKR 800</strong></label
            >
          </div>
          <div class="checkout-step">
            <span class="step-number"><CreditCard /></span>
            <div class="checkout-section-head">
              <div>
                <h2>Payment method</h2>
                <p>
                  {{
                    shop.selectedPayment === "cod"
                      ? "Pay when your order arrives."
                      : "Selected payment option"
                  }}
                </p>
              </div>
              <RouterLink to="/payment" class="text-link">{{
                shop.selectedPayment === "cod" ? "Change" : "Change payment"
              }}</RouterLink>
            </div>
          </div>
          <div class="selected-payment">
            <CreditCard /><span
              ><b>{{
                shop.selectedPayment === "cod"
                  ? "Cash on delivery"
                  : shop.selectedPayment === "card"
                    ? "Credit or debit card"
                    : shop.selectedPayment
              }}</b
              ><small>Mock payment flow for this project phase</small></span
            ><Check />
          </div>
          <div v-if="error" class="form-alert" role="alert">{{ error }}</div>
        </section>
        <aside class="order-summary">
          <h2>Order summary</h2>
          <div
            v-for="line in shop.cartProducts"
            :key="line.product.id"
            class="checkout-item"
          >
            <img :src="line.product.image" :alt="line.product.name" /><span
              >{{ line.product.name }}
              <small>Qty {{ line.quantity }}</small></span
            ><b>PKR {{ money(line.product.price * line.quantity) }}</b>
          </div>
          <div class="summary-row">
            <span>Items ({{ shop.cartCount }})</span
            ><b>PKR {{ money(shop.cartTotal) }}</b>
          </div>
          <div class="summary-row">
            <span>Delivery</span
            ><b>{{
              deliveryFee === 0 ? "FREE" : `PKR ${money(deliveryFee)}`
            }}</b>
          </div>
          <div class="voucher-entry">
            <label for="checkout-voucher">Voucher code</label>
            <div>
              <input
                id="checkout-voucher"
                v-model="voucherCode"
                placeholder="Enter code"
              /><button class="secondary-button" @click="applyVoucher">
                Apply
              </button>
            </div>
            <small
              :class="
                shop.voucherDiscount ? 'voucher-applied' : 'voucher-message'
              "
              >{{ voucherMessage || "Try BAZAARX10 for 10% off." }}</small
            >
          </div>
          <div v-if="shop.voucherDiscount" class="summary-row voucher-discount">
            <span>Voucher discount</span
            ><b>− PKR {{ money(shop.voucherDiscount) }}</b>
          </div>
          <div class="summary-divider" />
          <div class="summary-row summary-total">
            <span>Total</span><b>PKR {{ money(total) }}</b>
          </div>
          <button
            class="button button-primary checkout-button"
            :disabled="placing"
            @click="placeOrder"
          >
            {{ placing ? "Placing order…" : "Place order" }} <Check :size="16" />
          </button>
          <p class="secure-note"><ShieldCheck /> Your details are protected</p>
        </aside>
      </div>
      <div v-else class="empty-card">
        <StatusView
          mode="empty"
          title="Your cart is empty"
          message="Add something before checking out."
        /><RouterLink to="/search" class="button button-primary"
          >Browse products</RouterLink
        >
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
