<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { sellerData } from "../data";
import { ArrowLeft, Save, Check } from "lucide-vue-next";
import { marketplaceApi, uploadProductImage, type ListingCopy } from "../services/marketplace";
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
const shortDescription = ref(existing.value?.shortDescription ?? "");
const description = ref(existing.value?.description ?? "");
const specifications = ref(existing.value?.specifications ?? "");
const images = ref(existing.value?.images ?? []);
const uploadingImage = ref(false);
const error = ref("");
const aiLoading = ref(false);
const aiCopy = ref<ListingCopy | null>(null);
const quality = ref<{score:number;suggestions:string[]}|null>(null);
async function generateCopy() {
  error.value = ""; aiLoading.value = true;
  try {
    if (marketplaceApi.enabled) aiCopy.value = await marketplaceApi.generateListing({title:title.value,category:category.value,specifications:specifications.value});
    else aiCopy.value = {provider:"local-demo",seoTitle:`${title.value} | BazaarX ${category.value}`,shortDescription:`${title.value} for everyday use. Shop confidently on BazaarX.`,description:`${title.value} is a quality choice in ${category.value}. ${specifications.value.trim() || "Add verified product specifications to help shoppers make an informed choice."} Enjoy convenient delivery and buyer support through BazaarX.`,bullets:["Clear product details","Convenient delivery","BazaarX buyer support"],keywords:[title.value,category.value]};
  } catch(cause) { error.value = cause instanceof Error ? cause.message : "Listing copy could not be generated."; }
  finally { aiLoading.value = false; }
}
function applyCopy() { if (!aiCopy.value) return; title.value = aiCopy.value.seoTitle; shortDescription.value = aiCopy.value.shortDescription; description.value = aiCopy.value.description; }
async function checkQuality() { try { quality.value = marketplaceApi.enabled ? await marketplaceApi.listingQuality({title:title.value,category:category.value,description:description.value,images:images.value,specifications:specifications.value}) : {score:[title.value.length>=15,Boolean(category.value),description.value.length>=60,images.value.length>=3,specifications.value.length>=10].filter(Boolean).length*20,suggestions:[...(title.value.length<15?["Use a more specific title."]:[]),...(description.value.length<60?["Write a more helpful product description."]:[]),...(specifications.value.length<10?["Add product specifications."]:[]),...(images.value.length<3?["Add at least three product images."]:[])]}; } catch(cause) { error.value = cause instanceof Error ? cause.message : "Listing quality could not be checked."; } }
async function addImage(event: Event) { const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;if(file.size>5*1024*1024){error.value="Choose an image smaller than 5 MB.";input.value="";return;}uploadingImage.value=true;error.value="";try{images.value.push(await uploadProductImage(file));}catch(cause){error.value=cause instanceof Error?cause.message:"Image upload failed.";}finally{uploadingImage.value=false;input.value="";} }
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
      shortDescription: shortDescription.value,
      description: description.value,
      specifications: specifications.value,
      images: images.value,
    });
  } else
    sellerData.products.unshift({
      id: `SP-${Date.now()}`,
      title: title.value.trim(),
      category: category.value,
      sku: sku.value.trim(),
      price: price.value,
      stock: stock.value,
      shortDescription: shortDescription.value,
      description: description.value,
      specifications: specifications.value,
      images: images.value,
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
          v-model="shortDescription"
          class="seller-input"
          rows="4"
          maxlength="500"
          placeholder="What makes this product useful?"
        />
      </label>
      <label class="form-field"><span>Full description</span><textarea v-model="description" class="seller-input" rows="5" placeholder="Add complete product details" /></label>
      <label class="form-field"><span>Specifications</span><textarea v-model="specifications" class="seller-input" rows="3" placeholder="Battery: 5000 mAh, Storage: 256 GB" /></label>
      <section class="listing-ai"><div><b>Listing assistant</b><small>Generate a draft from product details. Review it before using.</small></div><div class="listing-ai-actions"><button type="button" class="secondary-button" :disabled="aiLoading || !title.trim()" @click="generateCopy">{{ aiLoading ? "Generating…" : "Generate listing draft" }}</button><button type="button" class="secondary-button" @click="checkQuality">Check listing quality</button></div><article v-if="aiCopy"><b>{{ aiCopy.seoTitle }}</b><p>{{ aiCopy.shortDescription }}</p><button type="button" class="primary-button" @click="applyCopy">Use this draft</button></article><article v-if="quality"><b>Listing quality: {{ quality.score }} / 100</b><small v-for="suggestion in quality.suggestions" :key="suggestion">{{ suggestion }}</small></article></section>
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
        <span><Save /></span><b>Product images</b>
        <small>JPG, PNG, or WebP · up to 5 MB per image.</small>
        <label class="secondary-button image-picker">{{ uploadingImage ? "Uploading…" : "Add image" }}<input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploadingImage" @change="addImage" /></label>
        <div v-if="images.length" class="product-image-list"><figure v-for="(image,index) in images" :key="image"><img :src="image" :alt="`Product image ${index+1}`" /><button type="button" :aria-label="`Remove product image ${index+1}`" @click="images.splice(index,1)">Remove</button></figure></div>
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
