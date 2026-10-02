<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowDownToLine, Check, ChevronRight, Plus, Search, Send, Store, TrendingUp } from "lucide-vue-next";
import { marketplaceApi } from "../services/marketplace";

type Row = { name: string; detail: string; status: string; value: string };
const route = useRoute();
const section = computed(() => String(route.meta.tool ?? route.path.split("/")[1] ?? "finance"));
const catalog: Record<string, { title: string; eyebrow: string; description: string; stats: string[]; rows: Row[]; action: string }> = {
  returns: { title: "Returns", eyebrow: "CUSTOMER CARE", description: "Review return and refund requests for your store.", stats: ["4 open requests", "PKR 38,400 requested", "2 due today"], action: "Review request", rows: [{ name: "BX-240812-7843", detail: "Ayesha Khan · Galaxy S24 Ultra", status: "New request", value: "PKR 229,999" }, { name: "BX-240728-5641", detail: "Usman Ali · Wireless headphones", status: "Under review", value: "PKR 84,999" }, { name: "BX-240712-4412", detail: "Sana Ahmed · Galaxy Buds", status: "Approved", value: "PKR 28,999" }] },
  promotions: { title: "Promotions", eyebrow: "GROW YOUR SALES", description: "Create and track store offers and product discounts.", stats: ["3 active offers", "PKR 412,300 sales", "8.4% average discount"], action: "Create promotion", rows: [{ name: "Weekend technology picks", detail: "Selected products · Ends 30 Oct", status: "Active", value: "15% off" }, { name: "New customer welcome", detail: "Store-wide · Ends 15 Nov", status: "Scheduled", value: "PKR 1,000 off" }, { name: "Clearance essentials", detail: "4 products · Ends 20 Oct", status: "Draft", value: "Up to 25% off" }] },
  finance: { title: "Seller finance", eyebrow: "YOUR EARNINGS", description: "See sales proceeds, fees and settlement history.", stats: ["PKR 1,245,830 gross sales", "PKR 87,208 marketplace fees", "PKR 1,158,622 net earnings"], action: "Download statement", rows: [{ name: "Sales proceeds", detail: "Settled orders · This month", status: "Available", value: "PKR 1,158,622" }, { name: "Pending settlement", detail: "14 orders · Estimated 2 days", status: "Processing", value: "PKR 284,600" }, { name: "Marketplace fees", detail: "Commission and services", status: "Deducted", value: "PKR 87,208" }] },
  payouts: { title: "Payouts", eyebrow: "BANK SETTLEMENTS", description: "Review transfers and manage your payout schedule.", stats: ["PKR 284,600 pending", "PKR 1,158,622 paid", "Next payout 06 Oct"], action: "Request payout", rows: [{ name: "PO-2026-0918", detail: "Scheduled bank transfer", status: "Processing", value: "PKR 284,600" }, { name: "PO-2026-0884", detail: "Completed 25 Sep 2026", status: "Paid", value: "PKR 412,300" }, { name: "PO-2026-0820", detail: "Completed 11 Sep 2026", status: "Paid", value: "PKR 386,100" }] },
  analytics: { title: "Store analytics", eyebrow: "PERFORMANCE", description: "Understand store traffic, product views and conversion.", stats: ["2,450 visitors", "128 orders", "3.2% conversion"], action: "Export report", rows: [{ name: "Product page views", detail: "Compared to previous period", status: "+18%", value: "8,420" }, { name: "Add-to-cart rate", detail: "Visitors who saved an item", status: "+4%", value: "7.8%" }, { name: "Top traffic source", detail: "BazaarX search and category pages", status: "Organic", value: "54%" }] },
  store: { title: "Store settings", eyebrow: "YOUR STOREFRONT", description: "Manage public store details and customer-facing information.", stats: ["TechStore Official", "Verified seller", "4.8 / 5 rating"], action: "Save store profile", rows: [{ name: "Store display name", detail: "Visible on your product listings", status: "Published", value: "TechStore Official" }, { name: "Support email", detail: "Customer messages and order help", status: "Verified", value: "help@techstore.example" }, { name: "Store description", detail: "About your business", status: "Published", value: "Trusted technology retailer" }] },
  settings: { title: "Account settings", eyebrow: "SELLER PROFILE", description: "Control contact, notification and security preferences.", stats: ["Email verified", "Two-step login off", "Notifications on"], action: "Save preferences", rows: [{ name: "Order alerts", detail: "Email when a new order arrives", status: "Enabled", value: "Email" }, { name: "Low-stock alerts", detail: "Notify when stock is running low", status: "Enabled", value: "Email + portal" }, { name: "Login security", detail: "Two-step verification", status: "Optional", value: "Not enabled" }] },
  messages: { title: "Messages", eyebrow: "BUYER CONVERSATIONS", description: "Reply to product and order questions from shoppers.", stats: ["2 unread", "8 conversations", "Average reply 18 min"], action: "Send reply", rows: [{ name: "Ayesha Khan", detail: "Is the 256GB model available in black?", status: "Unread", value: "2 min ago" }, { name: "Hamza R.", detail: "Can I update my delivery instructions?", status: "Replied", value: "1 hour ago" }, { name: "Sana Ahmed", detail: "Thank you, received the package.", status: "Closed", value: "Yesterday" }] },
};
const page = computed(() => catalog[section.value] ?? catalog.finance);
const rows = ref<Row[]>([]);
const stats = ref<string[]>([]);
const search = ref("");
const feedback = ref("");
const reply = ref("");
const selectedConversation = ref("");
const campaignName = ref("");
const campaignDescription = ref("");
const filtered = computed(() => rows.value.filter((item) => `${item.name} ${item.detail} ${item.status}`.toLowerCase().includes(search.value.toLowerCase())));
function money(value: number) { return `PKR ${new Intl.NumberFormat("en-PK").format(value)}`; }
async function load() {
  rows.value = JSON.parse(localStorage.getItem(`bx-seller-${section.value}`) ?? "null") as Row[] ?? structuredClone(page.value.rows);
  stats.value = page.value.stats;
  feedback.value = "";
  if (!marketplaceApi.enabled) return;
  try {
    if (section.value === "finance") {
      const result = await marketplaceApi.finance("TechStore Official");
      stats.value = [money(result.gross), money(result.commission + result.paymentFees), money(result.net)];
      rows.value = [{ name: "Gross sales", detail: `${result.orderCount} orders · voucher contribution ${money(result.voucherContribution)}`, status: "Calculated", value: money(result.gross) }, { name: "Marketplace commission & fees", detail: `Commission ${money(result.commission)} · payment fees ${money(result.paymentFees)}`, status: "Deducted", value: money(result.commission + result.paymentFees) }, { name: "Seller net earnings", detail: `Shipping ${money(result.shipping)} · refunds ${money(result.refunds)}`, status: "Available", value: money(result.net) }];
    } else if (section.value === "analytics") {
      const result = await marketplaceApi.analytics("TechStore Official");
      stats.value = [money(result.revenue), `${result.orders} orders`, `${result.averageOrderValue ? money(result.averageOrderValue) : "PKR 0"} AOV`];
      rows.value = result.topProducts.length ? result.topProducts.map((product) => ({ name: product.name, detail: `${product.category} · ${product.units} units`, status: "Top product", value: money(product.revenue) })) : [{ name: "No sales in this period", detail: "Delivered order sales appear after fulfilment.", status: "Waiting", value: money(0) }];
    } else if (section.value === "payouts") {
      const result = await marketplaceApi.settlements("TechStore Official");
      rows.value = result.data.map((entry) => ({ name: entry.id, detail: `${new Date(entry.periodStart).toLocaleDateString()} — ${new Date(entry.periodEnd).toLocaleDateString()} · ${entry.orderIds.length} orders`, status: entry.status, value: money(entry.amount) }));
      if (!rows.value.length) rows.value = [{ name: "No settlement batches", detail: "Delivered orders become eligible for the weekly batch.", status: "Waiting", value: money(0) }];
      stats.value = ["Weekly settlement batches", `${result.data.filter((entry) => entry.status === "ELIGIBLE").length} eligible`, `${result.data.filter((entry) => entry.status === "SETTLED").length} paid`];
    } else if (section.value === "returns") {
      const result = await marketplaceApi.returns();
      const sellerReturns = result.data.filter((entry) => entry.seller.toLowerCase() === "techstore official");
      rows.value = sellerReturns.map((entry) => ({ name: entry.id, detail: `${entry.itemName} · ${entry.reason}`, status: entry.status, value: money(entry.refundAmount) }));
      stats.value = [`${sellerReturns.filter((entry) => !["REFUNDED", "REJECTED"].includes(entry.status)).length} active requests`, money(sellerReturns.reduce((sum, entry) => sum + entry.refundAmount, 0)), "Track every review step"];
    } else if (section.value === "messages") {
      const result = await marketplaceApi.conversations();
      rows.value = result.data.map((entry) => ({ name: entry.buyer, detail: entry.lastMessage, status: entry.online ? "Online" : "Offline", value: entry.updatedAt }));
      selectedConversation.value = result.data[0]?.id ?? "";
      stats.value = [`${result.data.length} conversations`, `${result.data.filter((entry) => entry.messages.some((message) => !message.read && message.sender === "buyer")).length} unread`, "Updates every 5 seconds"];
    } else if (section.value === "promotions") {
      const result = await marketplaceApi.campaigns();
      const campaigns = result.data.filter((entry) => entry.sellerNames.includes("TechStore Official"));
      rows.value = campaigns.map((entry) => ({ name: entry.name, detail: entry.description, status: entry.status, value: `${new Date(entry.endsAt).toLocaleDateString()} end` }));
    }
  } catch (cause) { feedback.value = cause instanceof Error ? cause.message : "The marketplace API could not be reached. Showing saved demo data."; }
}
watch(section, () => { void load(); }, { immediate: true });
async function act(row: Row) {
  try {
    if (section.value === "returns" && marketplaceApi.enabled) {
      await marketplaceApi.updateReturn(row.name, "APPROVED", "Seller approved return and requested pickup.");
      row.status = "APPROVED";
    } else if (section.value === "messages") row.status = "Replied";
    else row.status = row.status === "Approved" ? "Refunded" : row.status === "Processing" ? "Paid" : "Updated";
    localStorage.setItem(`bx-seller-${section.value}`, JSON.stringify(rows.value));
    feedback.value = `${row.name} updated successfully.`;
  } catch (cause) { feedback.value = cause instanceof Error ? cause.message : "Could not update this record."; }
}
async function primaryAction() {
  if (section.value === "messages" && reply.value.trim()) {
    try {
      if (marketplaceApi.enabled && selectedConversation.value) await marketplaceApi.sendMessage(selectedConversation.value, reply.value.trim());
      rows.value[0].detail = reply.value.trim(); reply.value = "";
      feedback.value = "Your reply has been sent."; await load();
    } catch (cause) { feedback.value = cause instanceof Error ? cause.message : "Your reply could not be sent."; }
  } else if (section.value === "promotions" && marketplaceApi.enabled) {
    if (!campaignName.value.trim()) { feedback.value = "Enter a campaign name first."; return; }
    try {
      const start = new Date(); const end = new Date(Date.now() + 7 * 86_400_000);
      const record = await marketplaceApi.createCampaign({ name: campaignName.value.trim(), description: campaignDescription.value.trim() || "Seller campaign application", startsAt: start.toISOString(), endsAt: end.toISOString() });
      campaignName.value = ""; campaignDescription.value = ""; feedback.value = `Campaign ${record.name} submitted for admin approval.`; await load();
    } catch (cause) { feedback.value = cause instanceof Error ? cause.message : "Campaign could not be submitted."; }
    return;
  } else if (section.value === "payouts" && marketplaceApi.enabled) {
    try { const result = await marketplaceApi.runSettlement("TechStore Official"); feedback.value = result.message; await load(); }
    catch (cause) { feedback.value = cause instanceof Error ? cause.message : "Settlement batch could not be created."; }
    return;
  } else if (section.value === "promotions" || section.value === "payouts") {
    rows.value.unshift({ name: `${section.value === "payouts" ? "PO" : "PROMO"}-${Date.now().toString().slice(-5)}`, detail: `New ${section.value === "payouts" ? "payout request" : "promotion draft"}`, status: "Draft", value: "Pending setup" });
    feedback.value = section.value === "payouts" ? "Payout request added to your queue." : "Promotion draft created.";
  } else if (section.value === "store" || section.value === "settings") {
    act(rows.value[0]);
    feedback.value = "Your preference was saved in this demo.";
    return;
  } else if (section.value === "analytics" || section.value === "finance") {
    const csv = ["Name,Details,Status,Value", ...rows.value.map((row) => `"${row.name}","${row.detail}","${row.status}","${row.value}"`)].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `bazaarx-seller-${section.value}.csv`; link.click(); URL.revokeObjectURL(link.href);
    feedback.value = "Your report has been downloaded.";
  } else {
    feedback.value = `${page.value.action} is ready in this demo workspace.`;
  }
  localStorage.setItem(`bx-seller-${section.value}`, JSON.stringify(rows.value));
}
</script>

<template><section class="seller-tools"><div class="tool-heading"><div><span class="tool-eyebrow">{{ page.eyebrow }}</span><h1>{{ page.title }}</h1><p>{{ page.description }}</p></div><button class="tool-primary" @click="primaryAction"><ArrowDownToLine v-if="['finance','analytics'].includes(section)" /><Plus v-else-if="['promotions','payouts'].includes(section)" /><Store v-else />{{ page.action }}</button></div><div class="tool-stats"><article v-for="(stat,index) in (stats.length ? stats : page.stats)" :key="stat"><small>{{ ["Overview","This period","Current status"][index] }}</small><b>{{ stat }}</b><span><TrendingUp /> {{ marketplaceApi.enabled ? 'Live mock API' : 'Demo data' }}</span></article></div><div class="tool-panel"><div class="tool-panel-head"><div><h2>{{ section === 'messages' ? 'Store inbox' : section === 'returns' ? 'Return requests' : section === 'payouts' ? 'Settlement history' : 'Overview' }}</h2><p>{{ filtered.length }} records</p></div><label><Search /><input v-model="search" aria-label="Search records" placeholder="Search this page" /></label></div><div v-if="['analytics','finance'].includes(section)" class="mini-chart" aria-label="Performance chart"><span v-for="height in [40,58,46,68,54,74,60,88,70,94,78,100]" :key="height" :style="{height:`${height}%`}"></span></div><form v-if="section === 'promotions' && marketplaceApi.enabled" class="campaign-form" @submit.prevent="primaryAction"><label>Campaign name<input v-model="campaignName" required placeholder="e.g. Payday Store Picks" /></label><label>Campaign details<input v-model="campaignDescription" placeholder="Products or offer summary" /></label><button>{{ page.action }}</button></form><table><thead><tr><th>{{ section === 'messages' ? 'Buyer' : 'Name' }}</th><th>Details</th><th>Status</th><th>Amount / value</th><th>Action</th></tr></thead><tbody><tr v-for="row in filtered" :key="row.name"><td><b>{{ row.name }}</b></td><td>{{ row.detail }}</td><td><span class="tool-badge">{{ row.status }}</span></td><td>{{ row.value }}</td><td><button class="tool-row-action" @click="act(row)">{{ section === 'returns' ? 'Approve' : section === 'messages' ? 'Mark replied' : 'Update' }} <ChevronRight /></button></td></tr></tbody></table><p v-if="!filtered.length" class="tool-empty">No matching records. Clear your search to view all records.</p><form v-if="section === 'messages'" class="reply-box" @submit.prevent="primaryAction"><input v-model="reply" aria-label="Write seller reply" placeholder="Write a reply to the selected buyer" /><button :disabled="!reply.trim()"><Send /> Reply</button></form><p v-if="feedback" class="tool-feedback" role="status"><Check /> {{ feedback }}</p></div></section></template>

<style scoped>
.seller-tools{color:#1b2b42}.tool-heading{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:0 0 20px}.tool-eyebrow{font-size:10px;letter-spacing:1px;color:#ee5728;font-weight:800}.tool-heading h1{font:800 26px Manrope;margin:6px 0}.tool-heading p{font-size:12px;color:#78869a;margin:0}.tool-primary{display:flex;align-items:center;gap:8px;border:0;border-radius:8px;padding:11px 13px;background:#f4511e;color:white;font-weight:700;cursor:pointer}.tool-primary svg{width:16px}.tool-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:15px}.tool-stats article,.tool-panel{background:white;border:1px solid #e7ecf2;border-radius:12px;padding:16px;box-shadow:0 8px 22px #20334a08}.tool-stats article{display:grid;gap:9px}.tool-stats small{color:#7d899a}.tool-stats b{font-size:18px}.tool-stats span{display:flex;align-items:center;gap:5px;font-size:10px;color:#16885a}.tool-stats svg{width:13px}.tool-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.tool-panel-head h2{margin:0 0 4px;font-size:16px}.tool-panel-head p{margin:0;color:#8290a1;font-size:11px}.tool-panel-head label{display:flex;align-items:center;gap:7px;border:1px solid #e0e6ed;border-radius:8px;padding:8px 10px;color:#8793a2}.tool-panel-head label svg{width:15px}.tool-panel-head input{border:0;outline:0;font:inherit;font-size:11px;min-width:120px}.tool-panel table{width:100%;border-collapse:collapse;font-size:11px}.tool-panel th,.tool-panel td{text-align:left;padding:12px 8px;border-top:1px solid #edf0f4}.tool-panel th{font-size:10px;color:#7f8b9a}.tool-panel td{color:#506078}.tool-panel td b{color:#203049}.tool-badge{display:inline-block;background:#edf5ff;border-radius:20px;padding:5px 8px;color:#2662c6;font-size:10px}.tool-row-action{border:1px solid #dfe5ec;border-radius:6px;background:white;padding:6px 8px;display:flex;align-items:center;gap:4px;font-size:10px;color:#364a64;cursor:pointer}.tool-row-action svg{width:12px}.tool-empty{padding:28px;text-align:center;color:#7f8b9a}.tool-feedback{display:flex;align-items:center;gap:6px;color:#16885a;font-size:12px}.tool-feedback svg{width:15px}.mini-chart{height:100px;display:flex;align-items:flex-end;gap:9px;padding:12px 6px}.mini-chart span{flex:1;background:linear-gradient(#ff9166,#f4511e);border-radius:4px 4px 0 0}.reply-box{display:flex;gap:8px;margin-top:13px}.reply-box input{flex:1;min-width:0;border:1px solid #e0e6ed;padding:10px;border-radius:8px}.reply-box button{border:0;border-radius:8px;background:#2463ce;color:white;padding:0 12px;display:flex;align-items:center;gap:5px}.reply-box svg{width:15px}@media(max-width:720px){.tool-heading{align-items:flex-start;flex-direction:column}.tool-stats{grid-template-columns:1fr}.tool-panel{overflow:auto}.tool-panel table{min-width:620px}.tool-panel-head{align-items:flex-start;flex-direction:column}}
</style>
