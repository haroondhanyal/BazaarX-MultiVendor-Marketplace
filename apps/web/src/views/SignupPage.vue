<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
  Gift,
  Heart,
  MapPin,
} from "lucide-vue-next";
import { validateEmail, validatePassword } from "@bazaarx/validation";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
const shop = useShopStore();
const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
function submit() {
  error.value = "";
  if (name.value.trim().length < 2) {
    error.value = "Enter your name to continue.";
    return;
  }
  if (!validateEmail(email.value)) {
    error.value = "Enter a valid email address.";
    return;
  }
  if (!validatePassword(password.value)) {
    error.value = "Password must be at least 8 characters.";
    return;
  }
  if (password.value !== confirm.value) {
    error.value = "Passwords do not match.";
    return;
  }
  shop.login(name.value.trim(), email.value);
  router.push("/account");
}
</script>
<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container auth-layout signup-layout">
      <section class="auth-promo signup-promo">
        <span class="eyebrow">MAKE ROOM FOR GOOD FINDS</span>
        <h1>Meet your new favourite way to shop.</h1>
        <p>
          Create your BazaarX account to make the everyday a little more
          delightful.
        </p>
        <div class="auth-benefit">
          <span><Gift /></span>
          <div>
            <b>Offers picked for you</b
            ><small>Hear about fresh finds and new arrivals</small>
          </div>
        </div>
        <div class="auth-benefit">
          <span><Heart /></span>
          <div>
            <b>Keep your favourites close</b
            ><small>Save items to your personal wishlist</small>
          </div>
        </div>
        <div class="auth-benefit">
          <span><MapPin /></span>
          <div>
            <b>Stay in the loop</b
            ><small>See your orders and delivery updates</small>
          </div>
        </div>
      </section>
      <form class="auth-card" @submit.prevent="submit">
        <span class="eyebrow">A BETTER WAY TO BROWSE</span>
        <h2>Create your account</h2>
        <p class="auth-subtitle">It only takes a moment to get started.</p>
        <div v-if="error" class="form-alert" role="alert">{{ error }}</div>
        <label class="form-field"
          ><span>Full name</span
          ><span class="input-with-icon"
            ><UserRound /><input
              v-model="name"
              autocomplete="name"
              placeholder="Your name"
              required /></span></label
        ><label class="form-field"
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
              type="password"
              autocomplete="new-password"
              placeholder="At least 8 characters"
              required /></span></label
        ><label class="form-field"
          ><span>Confirm password</span
          ><span class="input-with-icon"
            ><LockKeyhole /><input
              v-model="confirm"
              type="password"
              autocomplete="new-password"
              placeholder="Enter your password again"
              required /></span></label
        ><label class="check-row terms-check"
          ><input type="checkbox" required /><span
            >I agree to the <a href="#terms">Terms of Service</a> and
            <a href="#privacy">Privacy Policy</a>.</span
          ></label
        ><button class="button button-primary auth-submit" type="submit">
          Create account <ArrowRight :size="17" />
        </button>
        <p class="auth-switch">
          Already have an account? <RouterLink to="/login">Sign in</RouterLink>
        </p>
        <p class="mock-note">
          Demo phase: account details are stored in this browser only.
        </p>
      </form>
    </main>
    <SiteFooter />
  </div>
</template>
