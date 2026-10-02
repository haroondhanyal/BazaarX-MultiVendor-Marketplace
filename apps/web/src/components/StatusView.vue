<script setup lang="ts">
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-vue-next";
withDefaults(
  defineProps<{
    mode: "loading" | "empty" | "error";
    title?: string;
    message?: string;
  }>(),
  { title: "", message: "" },
);
</script>
<template>
  <div class="status-view">
    <div class="status-symbol" :class="`status-${mode}`">
      <span v-if="mode === 'loading'" class="spinner"></span
      ><ShoppingBag v-else-if="mode === 'empty'" /><AlertCircle v-else />
    </div>
    <h3>
      {{
        title ||
        (mode === "loading"
          ? "Loading..."
          : mode === "empty"
            ? "Nothing here yet"
            : "Something went wrong")
      }}
    </h3>
    <p>
      {{
        message ||
        (mode === "empty"
          ? "When you add something, it will show up here."
          : mode === "error"
            ? "Please try again in a moment."
            : "Please wait while we get things ready.")
      }}
    </p>
    <button
      v-if="mode === 'error'"
      class="button button-outline"
      @click="$emit('retry')"
    >
      <RefreshCw :size="16" /> Try again
    </button>
  </div>
</template>
