<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-vue-next";
import { validateEmail, validatePassword } from "@bazaarx/validation";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
const shop = useShopStore();
const route = useRoute();
const router = useRouter();
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
function submit() {
  error.value = "";
  if (!validateEmail(email.value)) {
    error.value = "Enter a valid email address.";
    return;
  }
  if (!validatePassword(password.value)) {
    error.value = "Password must be at least 8 characters.";
    return;
  }
  shop.login(
    email.value
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    email.value,
  );
  router.push(String(route.query.next || "/account"));
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container auth-layout">
      <section class="auth-promo">
        <span class="eyebrow">WELCOME TO BAZAARX</span>
        <h1>Your next great find is just around the corner.</h1>
        <p>
          Sign in to save favourites, follow your orders and enjoy a more
          personal way to shop.
        </p>
        <div class="auth-benefit">
          <span><ShoppingBag /></span>
          <div>
            <b>Good finds, all in one place</b
            ><small>Explore products from independent stores</small>
          </div>
        </div>
        <div class="auth-benefit">
          <span><ShieldCheck /></span>
          <div>
            <b>Shop with confidence</b
            ><small>Secure checkout and trusted sellers</small>
          </div>
        </div>
        <div class="auth-benefit">
          <span><Truck /></span>
          <div>
            <b>Keep every order in view</b
            ><small>Follow updates from checkout to doorstep</small>
          </div>
        </div>
        <div class="auth-decoration">
          <span></span><span></span><span></span>
        </div>
      </section>
      <form class="auth-card" @submit.prevent="submit">
        <span class="eyebrow">GOOD TO SEE YOU AGAIN</span>
        <h2>Sign in to BazaarX</h2>
        <p class="auth-subtitle">Use your email to continue to your account.</p>
        <div v-if="error" class="form-alert" role="alert">{{ error }}</div>
        <label class="form-field"
          ><span>Email address</span
          ><span class="input-with-icon"
            ><Mail /><input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required /></span></label
        ><label class="form-field"
          ><span>Password</span
          ><span class="input-with-icon"
            ><LockKeyhole /><input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="At least 8 characters"
              required /><button
              class="reveal-button"
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" /><Eye v-else /></button></span
        ></label>
        <div class="auth-extra">
          <label class="check-row"
            ><input type="checkbox" /><span>Remember me</span></label
          ><button type="button" class="text-button">Forgot password?</button>
        </div>
        <button class="button button-primary auth-submit" type="submit">
          Sign in <ArrowRight :size="17" />
        </button>
        <p class="auth-switch">
          New to BazaarX?
          <RouterLink to="/signup">Create an account</RouterLink>
        </p>
        <p class="mock-note">
          Demo phase: any valid email and 8-character password will sign you in
          locally.
        </p>
      </form>
    </main>
    <SiteFooter />
  </div>
</template>
