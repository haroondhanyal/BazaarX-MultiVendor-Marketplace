<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import {
  UserRound,
  Package,
  MapPin,
  Settings,
  Heart,
  Bell,
  LogOut,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
} from "lucide-vue-next";
import { validatePassword } from "@bazaarx/validation";
import { useShopStore } from "../stores/shop";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";

const shop = useShopStore();
const route = useRoute();
const section = computed(() => String(route.params.section ?? "overview"));
const title = computed(
  () =>
    ({
      overview: "My account",
      profile: "Profile details",
      addresses: "Saved addresses",
      security: "Security",
    })[section.value] ?? "My account",
);
const profileName = ref(shop.user?.name ?? "");
const profileSaved = ref(false);
const addressLabel = ref("Home");
const addressText = ref("");
const addresses = ref<string[]>(
  JSON.parse(localStorage.getItem("bx-addresses") ?? "[]") as string[],
);
const password = ref("");
const passwordMessage = ref("");
function saveProfile() {
  if (shop.user) shop.login(profileName.value.trim(), shop.user.email);
  profileSaved.value = true;
}
function addAddress() {
  if (!addressText.value.trim()) return;
  addresses.value.push(`${addressLabel.value}: ${addressText.value.trim()}`);
  localStorage.setItem("bx-addresses", JSON.stringify(addresses.value));
  addressText.value = "";
}
function removeAddress(index: number) {
  addresses.value.splice(index, 1);
  localStorage.setItem("bx-addresses", JSON.stringify(addresses.value));
}
function changePassword() {
  passwordMessage.value = validatePassword(password.value)
    ? "Password updated for this demo session."
    : "Use at least 8 characters.";
}
function signOut() {
  shop.logout();
  window.location.href = "/";
}
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page">
      <div class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span>/</span
        ><span>{{ title }}</span>
      </div>
      <div class="account-layout">
        <aside class="account-sidebar">
          <div class="account-profile">
            <span class="account-avatar">{{
              shop.user?.name.slice(0, 1).toUpperCase()
            }}</span>
            <div>
              <b>{{ shop.user?.name }}</b
              ><small>{{ shop.user?.email }}</small>
            </div>
          </div>
          <RouterLink
            class="account-nav"
            :class="{ active: section === 'overview' }"
            to="/account"
            ><UserRound /> Overview</RouterLink
          >
          <RouterLink
            class="account-nav"
            :class="{ active: section === 'orders' }"
            to="/account/orders"
            ><Package /> My orders</RouterLink
          >
          <RouterLink class="account-nav" to="/wishlist"
            ><Heart /> Wishlist</RouterLink
          >
          <RouterLink
            class="account-nav"
            :class="{ active: section === 'addresses' }"
            to="/account/addresses"
            ><MapPin /> Saved addresses</RouterLink
          >
          <RouterLink
            class="account-nav"
            :class="{ active: section === 'profile' }"
            to="/account/profile"
            ><Settings /> Profile settings</RouterLink
          >
          <RouterLink
            class="account-nav"
            :class="{ active: section === 'security' }"
            to="/account/security"
            ><ShieldCheck /> Security</RouterLink
          >
          <button class="account-nav signout-link" @click="signOut">
            <LogOut /> Sign out
          </button>
        </aside>
        <section class="account-main">
          <template v-if="section === 'overview' || section === 'orders'">
            <span class="eyebrow">YOUR BAZAARX</span>
            <h1>
              {{
                section === "orders"
                  ? "My orders"
                  : `Welcome back, ${shop.user?.name.split(" ")[0]}.`
              }}
            </h1>
            <p class="account-intro">
              {{
                section === "orders"
                  ? "Keep track of your marketplace purchases."
                  : "Here's a quick look at your BazaarX account."
              }}
            </p>
            <div v-if="section === 'overview'" class="account-stat-row">
              <div><Package /><b>0</b><span>Orders</span></div>
              <div>
                <Heart /><b>{{ shop.wishlist.length }}</b
                ><span>Saved finds</span>
              </div>
              <div>
                <MapPin /><b>{{ addresses.length }}</b
                ><span>Addresses</span>
              </div>
            </div>
            <div class="account-panel">
              <div class="panel-heading">
                <div>
                  <h2>
                    {{
                      section === "orders" ? "Order history" : "Recent orders"
                    }}
                  </h2>
                  <p>Your latest marketplace purchases</p>
                </div>
                <RouterLink
                  v-if="section === 'overview'"
                  to="/account/orders"
                  class="text-link"
                  >View all <ArrowRight :size="15"
                /></RouterLink>
              </div>
              <div v-if="shop.orders.length" class="account-order-list">
                <RouterLink
                  v-for="order in section === 'orders'
                    ? shop.orders
                    : shop.orders.slice(0, 3)"
                  :key="order.id"
                  :to="`/account/orders/${order.id}`"
                  class="account-order-row"
                >
                  <Package /><span
                    ><b>{{ order.id }}</b
                    ><small
                      >{{ order.items.length }} items ·
                      {{
                        new Date(order.createdAt).toLocaleDateString()
                      }}</small
                    ></span
                  ><i>{{ order.status.replaceAll("_", " ") }}</i
                  ><strong
                    >PKR
                    {{
                      new Intl.NumberFormat("en-PK").format(order.total)
                    }}</strong
                  ><ArrowRight />
                </RouterLink>
              </div>
              <div v-else class="account-empty">
                <ShoppingBag /><b>No orders just yet</b>
                <p>When you place an order, its progress will appear here.</p>
                <RouterLink to="/search" class="button button-primary"
                  >Find something good</RouterLink
                >
              </div>
            </div>
          </template>
          <template v-else-if="section === 'profile'">
            <span class="eyebrow">YOUR PERSONAL DETAILS</span>
            <h1>Profile details</h1>
            <p class="account-intro">
              Keep your contact information up to date.
            </p>
            <form class="account-form" @submit.prevent="saveProfile">
              <label class="form-field"
                ><span>Full name</span
                ><input
                  v-model="profileName"
                  class="plain-input"
                  autocomplete="name"
                  required /></label
              ><label class="form-field"
                ><span>Email address</span
                ><input
                  :value="shop.user?.email"
                  class="plain-input"
                  type="email"
                  disabled
                /><small
                  >Email changes are not available in this demo.</small
                ></label
              ><button class="button button-primary">
                Save changes <Check :size="15" /></button
              ><span v-if="profileSaved" class="success-message"
                >Your profile has been updated.</span
              >
            </form>
          </template>
          <template v-else-if="section === 'addresses'">
            <span class="eyebrow">DELIVERY DETAILS</span>
            <h1>Saved addresses</h1>
            <p class="account-intro">
              Choose where you'd like your orders delivered.
            </p>
            <div class="account-panel address-panel">
              <article
                v-for="(address, index) in addresses"
                :key="address"
                class="saved-address"
              >
                <MapPin /><span>{{ address }}</span
                ><button
                  class="remove-button"
                  aria-label="Remove address"
                  @click="removeAddress(index)"
                >
                  <Trash2 />
                </button>
              </article>
              <div v-if="!addresses.length" class="address-empty">
                No saved addresses yet. Add one below.
              </div>
            </div>
            <form class="account-form" @submit.prevent="addAddress">
              <h2>Add a delivery address</h2>
              <label class="form-field"
                ><span>Address label</span
                ><select v-model="addressLabel" class="plain-input">
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select></label
              ><label class="form-field"
                ><span>Address</span
                ><textarea
                  v-model="addressText"
                  class="plain-input"
                  rows="3"
                  placeholder="House, street, area and city"
                  required
                /></label
              ><button class="button button-primary">
                <Plus :size="15" /> Add address
              </button>
            </form>
          </template>
          <template v-else>
            <span class="eyebrow">ACCOUNT PROTECTION</span>
            <h1>Security</h1>
            <p class="account-intro">Manage your sign-in credentials.</p>
            <form class="account-form" @submit.prevent="changePassword">
              <label class="form-field"
                ><span>New password</span
                ><input
                  v-model="password"
                  class="plain-input"
                  type="password"
                  autocomplete="new-password"
                  minlength="8"
                  required
                /><small>Use at least 8 characters.</small></label
              ><button class="button button-primary">Update password</button>
              <p v-if="passwordMessage" class="success-message" role="status">
                {{ passwordMessage }}
              </p>
              <p class="mock-note">
                Password changes are simulated locally during this phase.
              </p>
            </form>
          </template>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
