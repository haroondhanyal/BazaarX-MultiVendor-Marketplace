<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MapPin, Moon, Phone,
  ShieldCheck, Sun, Upload, UserRound,
} from "lucide-vue-next";
import { authenticateDemoAccount, countries, demoAccounts, getThemeMode, registerDemoAccount, toggleThemeMode, type CountryCode } from "@bazaarx/ui";
import { adminData } from "../data";

const router = useRouter();
const mode = ref<"signin" | "signup">("signin");
const showPassword = ref(false);
const darkMode = ref(getThemeMode() === "dark");
const countryCode = ref<CountryCode>("PK");
const profileImage = ref("");
const error = ref("");
const form = reactive({ name: "", email: "", phone: "", city: "", password: "" });
const country = computed(() => countries.find((item) => item.code === countryCode.value) ?? countries[0]);

function setMode(nextMode: "signin" | "signup") {
  mode.value = nextMode;
  error.value = "";
}
function toggleTheme() { darkMode.value = toggleThemeMode() === "dark"; }

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    error.value = "Please choose an image file.";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    error.value = "Choose an image smaller than 3 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { profileImage.value = String(reader.result ?? ""); };
  reader.onerror = () => { error.value = "This image could not be opened."; };
  reader.readAsDataURL(file);
}

function submit() {
  error.value = "";
  if (form.password.length < 8) {
    error.value = "Password must be at least 8 characters.";
    return;
  }
  if (mode.value === "signup") {
    const registered = registerDemoAccount("admin", {
      name: form.name.trim(), email: form.email.trim(), password: form.password,
      phone: `${country.value.dial} ${form.phone.trim()}`, city: form.city.trim(), country: country.value.name,
    });
    if (!registered) {
      error.value = "This email already has a demo admin profile. Please sign in.";
      return;
    }
    localStorage.setItem("bx-admin-profile", JSON.stringify({
      name: form.name.trim(), email: form.email.trim(), phone: `${country.value.dial} ${form.phone.trim()}`,
      city: form.city.trim(), country: country.value.name, countryCode: country.value.code, image: profileImage.value,
    }));
  } else {
    const account = authenticateDemoAccount("admin", form.email, form.password);
    if (!account) {
      error.value = "Account not found. Use one of the demo accounts below.";
      return;
    }
    const { name, email, phone, city, country: countryName } = account;
    localStorage.setItem("bx-admin-profile", JSON.stringify({ name, email, phone, city, country: countryName }));
  }
  adminData.loggedIn = true;
  void router.push("/");
}
</script>

<template>
  <main class="auth-page admin-auth">
    <div class="auth-glow auth-glow-one"></div><div class="auth-glow auth-glow-two"></div>
    <button class="auth-theme-toggle" type="button" :aria-label="darkMode ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme"><Sun v-if="darkMode" /><Moon v-else />{{ darkMode ? 'Light mode' : 'Dark mode' }}</button>
    <div class="auth-layout">
      <section class="auth-story">
        <RouterLink to="/login" class="auth-brand"><img src="/assets/branding/bazaarx-logo.png" alt="BazaarX" /><span>BAZAAR<span>X</span></span></RouterLink>
        <div class="auth-story-copy">
          <span class="auth-kicker"><ShieldCheck /> ADMIN WORKSPACE</span>
          <h1>Keep every<br /><span>marketplace moving.</span></h1>
          <p>Review sellers, moderate listings and follow marketplace operations from one focused control room.</p>
          <div class="auth-highlights">
            <div><b>Clear oversight</b><span>See key marketplace activity at a glance</span></div>
            <div><b>Purpose-built controls</b><span>Tools for reviews, orders and support</span></div>
          </div>
        </div>
        <span class="auth-footnote"><ShieldCheck /> Admin workspace · BazaarX Marketplace</span>
      </section>

      <section class="auth-card-wrap">
        <div class="auth-card">
          <div class="auth-mobile-brand"><img src="/assets/branding/bazaarx-logo.png" alt="BazaarX" /><b>BAZAAR<span>X</span></b></div>
          <div class="auth-switch"><button :class="{ active: mode === 'signin' }" @click="setMode('signin')">Sign in</button><button :class="{ active: mode === 'signup' }" @click="setMode('signup')">Create account</button></div>
          <span class="auth-kicker card-kicker">{{ mode === 'signin' ? 'ADMIN ACCESS' : 'DEMO ACCESS' }}</span>
          <h2>{{ mode === 'signin' ? 'Welcome to your workspace' : 'Create admin profile' }}</h2>
          <p class="auth-subtitle">{{ mode === 'signin' ? 'Sign in to manage BazaarX operations.' : 'Set up a local demo profile for this browser.' }}</p>

          <form class="auth-form" @submit.prevent="submit">
            <label v-if="mode === 'signup'" class="auth-field"><span>Full name</span><span class="auth-control"><UserRound /><input v-model="form.name" autocomplete="name" placeholder="Your name" required /></span></label>
            <label class="auth-field"><span>Email address</span><span class="auth-control"><Mail /><input v-model="form.email" type="email" autocomplete="email" placeholder="admin@bazaarx.example" required /></span></label>
            <template v-if="mode === 'signup'">
              <label class="auth-field"><span>Mobile number</span><span class="auth-control phone-control"><span class="dial-prefix">{{ country.flag }} {{ country.dial }}</span><Phone /><input v-model="form.phone" type="tel" autocomplete="tel-national" placeholder="300 1234567" required /></span></label>
              <div class="auth-field"><label for="admin-country"><span>Country</span></label><span class="auth-control"><MapPin /><select id="admin-country" v-model="countryCode" autocomplete="country-name"><option v-for="item in countries" :key="item.code" :value="item.code">{{ item.flag }} {{ item.name }}</option></select></span></div>
              <label class="auth-field"><span>City</span><span class="auth-control"><MapPin /><input v-model="form.city" autocomplete="address-level2" placeholder="e.g. Karachi" required /></span></label>
              <label class="auth-photo"><input type="file" accept="image/*" @change="selectImage" /><span class="auth-photo-preview"><img v-if="profileImage" :src="profileImage" alt="Profile preview" /><UserRound v-else /></span><span><b>{{ profileImage ? 'Change profile photo' : 'Add a profile photo' }}</b><small>Optional · JPG or PNG, up to 3 MB</small></span><Upload class="photo-upload-icon" /></label>
            </template>
            <label class="auth-field"><span>Password</span><span class="auth-control"><LockKeyhole /><input v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'" placeholder="At least 8 characters" minlength="8" required /><button class="password-toggle" type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" /><Eye v-else /></button></span></label>
            <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
            <button class="auth-submit" type="submit">{{ mode === 'signin' ? 'Sign in' : 'Create demo profile' }} <ArrowRight /></button>
          </form>
          <details v-if="mode === 'signin'" class="auth-demo-list"><summary>Show 2 demo admin accounts</summary><div v-for="account in demoAccounts.admin" :key="account.email"><b>{{ account.name }}</b><span>{{ account.email }}</span><code>{{ account.password }}</code></div></details>
          <p class="auth-legal">{{ mode === 'signup' ? 'Demo accounts are saved only in this browser and are not verified.' : 'Demo access accepts any valid email and password with 8+ characters.' }}</p>
          <button v-if="mode === 'signup'" class="auth-secondary-link mode-link" @click="setMode('signin')">Already have demo access? Sign in</button>
        </div>
        <span class="auth-card-foot">BAZAARX <i>·</i> ADMIN TOOLS</span>
      </section>
    </div>
  </main>
</template>
