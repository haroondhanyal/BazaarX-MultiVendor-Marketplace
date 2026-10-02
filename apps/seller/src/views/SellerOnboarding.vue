<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  MapPin,
  Landmark,
  UserRound,
  Building2,
  FileCheck2,
} from "lucide-vue-next";
import { sellerData } from "../data";
const router = useRouter();
const step = ref(0);
const answers = ref(["", "", "", "", "", "", ""]);
const submitted = ref(false);
const titles = [
  "Account",
  "Seller type",
  "Identity",
  "Store details",
  "Pickup address",
  "Return address",
  "Bank details",
  "Review",
  "Submitted",
];
const prompt = computed(
  () =>
    [
      "Confirm your business email and contact phone.",
      "Choose whether you are selling as an individual or a registered business.",
      "Enter a demo identity or business registration reference.",
      "Name your store and tell customers what you sell.",
      "Add the address used for order pickups.",
      "Add the address for eligible customer returns.",
      "Enter settlement account details for the mock review.",
      "Review your setup before sending it to the BazaarX team.",
      "Your seller profile is queued for demo review.",
    ][step.value],
);
const icons = [
  UserRound,
  Building2,
  FileCheck2,
  Store,
  MapPin,
  MapPin,
  Landmark,
  Check,
  Check,
];
function next() {
  if (step.value < 7 && !answers.value[step.value]?.trim()) {
    submitted.value = false;
    return;
  }
  if (step.value === 7) {
    step.value = 8;
    submitted.value = true;
    return;
  }
  if (step.value < 8) step.value++;
}
function finish() {
  sellerData.loggedIn = true;
  router.push("/");
}
</script>
<template>
  <main class="onboarding-page">
    <RouterLink to="/" class="login-logo"
      ><img src="/assets/branding/bazaarx-logo.png" alt="BazaarX" /></RouterLink
    ><RouterLink v-if="step === 0" to="/login" class="onboarding-back"
      ><ArrowLeft /> Back to sign in</RouterLink
    >
    <section class="onboarding-card">
      <span class="eyebrow">SELLER ONBOARDING</span>
      <h1>{{ step === 8 ? "Application submitted" : "Set up your store" }}</h1>
      <p>{{ prompt }}</p>
      <div class="onboarding-progress">
        <div
          v-for="(item, index) in titles.slice(0, 8)"
          :key="item"
          :class="{ active: index === step, done: index < step }"
        >
          <span>{{ index < step ? "✓" : index + 1 }}</span
          ><small>{{ item }}</small>
        </div>
      </div>
      <div v-if="step < 8" class="onboarding-form">
        <span class="onboarding-icon"><component :is="icons[step]" /></span
        ><label class="form-field"
          ><span>{{ titles[step] }} information <i>*</i></span
          ><input
            v-model="answers[step]"
            class="seller-input"
            :placeholder="
              step === 1
                ? 'Type Individual or Business'
                : step === 3
                  ? 'Your store name'
                  : step >= 4 && step <= 5
                    ? 'Street, area, city'
                    : step === 6
                      ? 'Bank name and account ending'
                      : 'Enter details'
            "
          /><small v-if="step === 2"
            >Mock identity check only. Do not enter sensitive identification
            data.</small
          ></label
        >
      </div>
      <div v-else class="application-submitted">
        <span><Check /></span><b>Thanks for applying.</b>
        <p>
          Your demo store can be explored now. Formal verification will be
          connected in a later phase.
        </p>
      </div>
      <div class="form-actions">
        <button
          v-if="step > 0 && step < 8"
          class="secondary-button"
          @click="step--"
        >
          <ArrowLeft /> Back</button
        ><button v-if="step < 8" class="primary-button" @click="next">
          {{ step === 7 ? "Submit for review" : "Continue" }}
          <ArrowRight /></button
        ><button v-else class="primary-button" @click="finish">
          Open Seller Center <Check />
        </button>
      </div>
      <p class="mock-note">
        Onboarding data is not sent to a real verification service.
      </p>
    </section>
  </main>
</template>
