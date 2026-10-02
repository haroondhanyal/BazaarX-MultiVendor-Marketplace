<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Mail, LockKeyhole, Store, ArrowRight } from "lucide-vue-next";
import { sellerData } from "../data";
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
function submit() {
  if (!email.value.includes("@") || password.value.length < 8) {
    error.value =
      "Enter a valid email and a password of at least 8 characters.";
    return;
  }
  sellerData.loggedIn = true;
  router.push("/");
}
</script>
<template>
  <main class="seller-login">
    <RouterLink to="/" class="login-logo"
      ><img src="/assets/branding/bazaarx-logo.svg" alt="BazaarX"
    /></RouterLink>
    <section>
      <span class="eyebrow">SELLER CENTER</span>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your BazaarX store.</p>
      <form @submit.prevent="submit">
        <label class="form-field"
          ><span>Business email</span
          ><span class="login-input"
            ><Mail /><input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@yourstore.com"
              required /></span></label
        ><label class="form-field"
          ><span>Password</span
          ><span class="login-input"
            ><LockKeyhole /><input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="At least 8 characters"
              required /></span
        ></label>
        <p v-if="error" class="form-alert" role="alert">{{ error }}</p>
        <button class="primary-button">Sign in <ArrowRight /></button>
      </form>
      <div class="seller-login-note">
        <Store /><span
          >Demo mode — use any valid email and 8-character password.</span
        >
      </div>
      <p class="seller-create-link">
        New seller?
        <RouterLink to="/onboarding">Set up your BazaarX store</RouterLink>
      </p>
    </section>
  </main>
</template>
