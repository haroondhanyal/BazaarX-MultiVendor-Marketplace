<script setup lang="ts">
import { ref, watch } from "vue";
import { ImageOff } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt: string;
    kind?: "product" | "store" | "avatar";
  }>(),
  { src: "", kind: "product" },
);
const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  />
  <span v-else class="image-fallback" role="img" :aria-label="alt"
    ><ImageOff :size="20" /><small>BazaarX</small></span
  >
</template>
