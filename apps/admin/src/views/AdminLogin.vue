<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Mail, LockKeyhole, ShieldCheck, ArrowRight } from "lucide-vue-next";
import { adminData } from "../data";
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
function submit() {
  if (!email.value.includes("@") || password.value.length < 8) {
    error.value = "Enter a valid admin email and an 8-character password.";
    return;
  }
  adminData.loggedIn = true;
  router.push("/");
}
</script>
<template>
  <main class="admin-login">
    <RouterLink class="admin-login-brand" to="/"
      ><img src="/assets/branding/bazaarx-logo.png" alt="BazaarX"
    /></RouterLink>
    <section>
      <span class="eyebrow">ADMIN PORTAL</span>
      <h1>Marketplace oversight.</h1>
      <p>Sign in to manage BazaarX operations.</p>
      <form @submit.prevent="submit">
        <label class="admin-field"
          ><span>Email address</span
          ><span class="admin-input"
            ><Mail /><input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="admin@bazaarx.example"
              required /></span></label
        ><label class="admin-field"
          ><span>Password</span
          ><span class="admin-input"
            ><LockKeyhole /><input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="At least 8 characters"
              required /></span
        ></label>
        <p v-if="error" class="admin-error" role="alert">{{ error }}</p>
        <button class="admin-primary">Sign in <ArrowRight /></button>
      </form>
      <div class="admin-login-note">
        <ShieldCheck /> Demo access only. Use any valid email and password of at
        least 8 characters.
      </div>
    </section>
  </main>
</template>
