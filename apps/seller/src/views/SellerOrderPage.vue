<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Check, PackageCheck, Truck, MapPin, RefreshCw } from "lucide-vue-next";
import { sellerData, formatPKR, type SellerOrder } from "../data";
import { marketplaceApi, type Shipment } from "../services/marketplace";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const busy = ref(false);
const error = ref("");
const shipment = ref<Shipment | null>(null);
const order = computed(() => sellerData.orders.find((item) => item.id === route.params.id));
const stepLabel = computed(() => {
  if (!order.value) return "Update fulfilment";
  if (order.value.status === "Pending") return "Accept order";
  if (order.value.status === "Processing") return "Create shipment";
  if (order.value.status === "Packed") return "Hand package to courier";
  if (order.value.status === "Shipped" && shipment.value?.status === "PICKED_UP") return "Scan at sorting center";
  if (order.value.status === "Shipped" && shipment.value?.status === "SORTING_CENTER") return "Arrive at regional hub";
  if (order.value.status === "Shipped" && shipment.value?.status === "REGIONAL_HUB") return "Out for delivery";
  if (order.value.status === "Shipped") return "Mark delivered";
  return "Order completed";
});

onMounted(async () => {
  if (!marketplaceApi.enabled) return;
  loading.value = true;
  try {
    const record = await marketplaceApi.order(String(route.params.id));
    const storeItems = record.items.filter((item) => item.seller.toLowerCase() === "techstore official");
    const state = record.status === "DELIVERED" ? "Delivered" : record.status === "SHIPPED" ? "Shipped" : record.status === "PACKED" ? "Packed" : record.status === "SELLER_PROCESSING" ? "Processing" : "Pending";
    const row: SellerOrder = { id: record.id, customer: "Marketplace customer", product: storeItems.map((item) => `${item.name} × ${item.quantity}`).join(", ") || record.items[0]?.name || "Marketplace order", amount: storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0) || record.total, status: state, date: new Date(record.createdAt).toLocaleDateString() };
    const index = sellerData.orders.findIndex((item) => item.id === row.id);
    if (index < 0) sellerData.orders.unshift(row); else sellerData.orders[index] = row;
    shipment.value = await marketplaceApi.shipmentForOrder(record.id);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "This order could not be loaded."; }
  finally { loading.value = false; }
});

async function advance() {
  if (!order.value || busy.value) return;
  error.value = "";
  busy.value = true;
  try {
    if (marketplaceApi.enabled) {
      if (order.value.status === "Pending") {
        await marketplaceApi.updateOrder(order.value.id, "SELLER_PROCESSING");
        order.value.status = "Processing";
      } else if (order.value.status === "Processing") {
        shipment.value = await marketplaceApi.createShipment(order.value.id);
        order.value.status = "Packed";
        order.value.shipmentId = shipment.value.id;
        order.value.trackingNumber = shipment.value.trackingNumber;
      } else if (order.value.status === "Packed") {
        if (!shipment.value) shipment.value = await marketplaceApi.shipmentForOrder(order.value.id);
        if (!shipment.value) throw new Error("Create the shipment before handing it to a courier.");
        shipment.value = await marketplaceApi.addShipmentEvent(shipment.value.id, "PICKED_UP", "Seller dispatch center", "Courier picked up the parcel.");
        order.value.status = "Shipped";
      } else if (order.value.status === "Shipped") {
        if (!shipment.value) shipment.value = await marketplaceApi.shipmentForOrder(order.value.id);
        if (!shipment.value) throw new Error("Shipment record is not available.");
        const next: Record<string, { status: string; location: string; notes: string }> = {
          PICKED_UP: { status: "SORTING_CENTER", location: "Karachi sorting center", notes: "Parcel sorted for regional transit." },
          SORTING_CENTER: { status: "REGIONAL_HUB", location: "Karachi regional hub", notes: "Parcel reached the local delivery hub." },
          REGIONAL_HUB: { status: "OUT_FOR_DELIVERY", location: "Customer area", notes: "Courier is on the way to the customer." },
          OUT_FOR_DELIVERY: { status: "DELIVERED", location: "Customer address", notes: "Order delivered successfully." },
          DELIVERY_ATTEMPTED: { status: "OUT_FOR_DELIVERY", location: "Customer area", notes: "Courier is retrying delivery." },
        };
        const event = next[shipment.value.status];
        if (!event) throw new Error("This shipment cannot advance from its current state.");
        shipment.value = await marketplaceApi.addShipmentEvent(shipment.value.id, event.status, event.location, event.notes);
        if (event.status === "DELIVERED") { order.value.status = "Delivered"; router.push("/orders"); }
      }
    } else {
      const next = { Pending: "Processing", Processing: "Shipped", Packed: "Shipped", Shipped: "Delivered", Delivered: "Delivered" } as const;
      order.value.status = next[order.value.status];
      if (order.value.status === "Delivered") router.push("/orders");
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "Fulfilment could not be updated."; }
  finally { busy.value = false; }
}
</script>

<template>
  <section class="page-content">
    <RouterLink to="/orders" class="back-link"><ArrowLeft /> Back to orders</RouterLink>
    <p v-if="loading" class="mock-note" role="status">Loading order from BazaarX…</p>
    <p v-if="error" class="form-alert" role="alert">{{ error }}</p>
    <template v-if="order">
      <div class="view-heading"><div><span class="eyebrow">ORDER FULFILMENT</span><h1>{{ order.id }}</h1><p>Order placed {{ order.date }} by {{ order.customer }}.</p></div><span class="status-chip" :class="`status-${order.status.toLowerCase()}`">{{ order.status }}</span></div>
      <div class="order-detail-grid-seller">
        <section class="seller-panel"><div class="panel-top"><div><h2>Order item</h2><p>Items fulfilled by your BazaarX store</p></div></div><div class="seller-order-product"><PackageCheck /><span><b>{{ order.product }}</b><small>Marketplace order</small></span><strong>PKR {{ formatPKR(order.amount) }}</strong></div><div v-if="shipment" class="shipment-reference"><Truck /><span><b>{{ shipment.courier }}</b><small>Tracking {{ shipment.trackingNumber }}</small></span></div><div class="fulfilment-timeline"><span class="done"><Check />Order placed</span><span :class="{done:['Processing','Packed','Shipped','Delivered'].includes(order.status)}"><PackageCheck />Processing</span><span :class="{done:['Packed','Shipped','Delivered'].includes(order.status)}"><PackageCheck />Packed</span><span :class="{done:['Shipped','Delivered'].includes(order.status)}"><Truck />Shipped</span><span :class="{done:order.status==='Delivered'}"><MapPin />Delivered</span></div></section>
        <aside class="seller-panel fulfilment-panel"><h2>Update fulfilment</h2><p>Every step creates a visible shipment update for the buyer.</p><div class="fulfilment-facts"><span>Customer<b>{{ order.customer }}</b></span><span>Order value<b>PKR {{ formatPKR(order.amount) }}</b></span><span>Current status<b>{{ order.status }}</b></span><span v-if="shipment">Courier<b>{{ shipment.courier }}</b></span></div><button class="primary-button" :disabled="order.status==='Delivered' || busy" @click="advance"><RefreshCw v-if="busy" /><Check v-else />{{ busy ? "Saving…" : stepLabel }}</button><p class="mock-note">{{ marketplaceApi.enabled ? "Changes update shipment tracking through the BazaarX API." : "Demo fulfilment updates are stored in this browser." }}</p></aside>
      </div>
    </template>
    <div v-else class="seller-panel small-empty">{{ loading ? "Loading order…" : "Order not found in the demo store or BazaarX API." }}</div>
  </section>
</template>
