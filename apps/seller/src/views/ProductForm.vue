<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { sellerData } from "../data";
import { ArrowLeft, Save, Check } from "lucide-vue-next";
const route = useRoute();
const router = useRouter();
const existing = computed(() =>
  sellerData.products.find((p) => p.id === route.params.id),
);
const title = ref(existing.value?.title ?? "");
const category = ref(existing.value?.category ?? "Electronics");
const sku = ref(existing.value?.sku ?? "");
const price = ref(existing.value?.price ?? 0);
const stock = ref(existing.value?.stock ?? 0);
const error = ref("");
function submit() {
  if (
    !title.value.trim() ||
    !sku.value.trim() ||
    price.value <= 0 ||
    stock.value < 0
  ) {
    error.value = "Complete the required fields with valid values.";
    return;
  }
  if (existing.value) {
    Object.assign(existing.value, {
      title: title.value.trim(),
      category: category.value,
      sku: sku.value.trim(),
      price: price.value,
      stock: stock.value,
    });
  } else
    sellerData.products.unshift({
      id: `SP-${Date.now()}`,
      title: title.value.trim(),
      category: category.value,
      sku: sku.value.trim(),
      price: price.value,
      stock: stock.value,
      status: "Under review",
    });
  router.push("/products");
}
</script>
<template>
  <section class="page-content">
    <RouterLink to="/products" class="back-link"
      ><ArrowLeft /> Back to products</RouterLink
    >
    <div class="view-heading form-heading">
      <div>
        <span class="eyebrow">PRODUCT LISTING</span>
        <h1>{{ existing ? "Edit product" : "Add a product" }}</h1>
        <p>Provide clear details so shoppers can find your product.</p>
      </div>
      <span class="form-step">1 of 4 · Basic information</span>
    </div>
    <form class="seller-panel product-form" @submit.prevent="submit">
      <div class="form-section-title">
        <h2>Basic information</h2>
        <p>Start with the details shoppers will see first.</p>
      </div>
      <label class="form-field"
        ><span>Product title <i>*</i></span
        ><input
          v-model="title"
          class="seller-input"
          maxlength="120"
          placeholder="Example: Wireless noise-cancelling headphones"
          required
      /></label>
      <div class="two-fields">
        <label class="form-field"
          ><span>Category <i>*</i></span
          ><select v-model="category" class="seller-input">
            <option>Mobiles</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home & Living</option>
            <option>Appliances</option>
            <option>Sports</option>
          </select></label
        ><label class="form-field"
          ><span>SKU <i>*</i></span
          ><input
            v-model="sku"
            class="seller-input"
            placeholder="Your stock keeping unit"
            required
        /></label>
      </div>
      <label class="form-field"
        ><span>Short description</span
        ><textarea
          class="seller-input"
          rows="4"
          maxlength="500"
          placeholder="What makes this product useful?"
        />
      </label>
      <div class="two-fields">
        <label class="form-field"
          ><span>Price (PKR) <i>*</i></span
          ><input
            v-model.number="price"
            type="number"
            min="1"
            class="seller-input"
            required /></label
        ><label class="form-field"
          ><span>Available stock <i>*</i></span
          ><input
            v-model.number="stock"
            type="number"
            min="0"
            class="seller-input"
            required
        /></label>
      </div>
      <div class="upload-placeholder">
        <span><Save /></span><b>Product images</b
        ><small
          >Image upload is enabled in a later phase. Save product details
          now.</small
        >
      </div>
      <p v-if="error" class="form-alert" role="alert">{{ error }}</p>
      <div class="form-actions">
        <RouterLink to="/products" class="secondary-button">Cancel</RouterLink
        ><button class="primary-button">
          <Check />
          {{ existing ? "Save changes" : "Save and submit for review" }}
        </button>
      </div>
    </form>
  </section>
</template>
