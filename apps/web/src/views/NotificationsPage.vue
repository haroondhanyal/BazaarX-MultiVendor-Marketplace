<script setup lang="ts">
import { computed, ref } from "vue";
import { Bell, PackageCheck, Tag, ShieldCheck, CheckCheck } from "lucide-vue-next";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";

interface Notice { id: string; title: string; message: string; time: string; kind: string; read: boolean }
const notices = ref<Notice[]>(JSON.parse(localStorage.getItem("bx-notifications") ?? "null") as Notice[] ?? [
  { id: "n1", title: "Welcome to BazaarX", message: "Your account is ready. Find something you love from trusted local stores.", time: "Today", kind: "account", read: false },
  { id: "n2", title: "Marketplace update", message: "New deals and fresh arrivals have been added this week.", time: "Yesterday", kind: "promotion", read: false },
  { id: "n3", title: "Safe shopping reminder", message: "Keep payments and conversations inside BazaarX for support.", time: "2 days ago", kind: "security", read: true },
]);
const unread = computed(() => notices.value.filter((item) => !item.read).length);
function save() { localStorage.setItem("bx-notifications", JSON.stringify(notices.value)); }
function markAll() { notices.value.forEach((item) => item.read = true); save(); }
function markRead(item: Notice) { item.read = true; save(); }
function icon(kind: string) { return kind === "order" ? PackageCheck : kind === "promotion" ? Tag : kind === "security" ? ShieldCheck : Bell; }
</script>

<template><div class="page-shell"><SiteHeader /><main class="container content-page"><div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Notifications</span></div><div class="notice-head"><div><span class="eyebrow">YOUR UPDATES</span><h1>Notifications <span>{{ unread }}</span></h1><p>Order, account and marketplace updates in one place.</p></div><button v-if="unread" @click="markAll"><CheckCheck /> Mark all as read</button></div><section class="notice-list"><article v-for="item in notices" :key="item.id" :class="{ unread: !item.read }"><span class="notice-icon"><component :is="icon(item.kind)" /></span><div><b>{{ item.title }}</b><p>{{ item.message }}</p><small>{{ item.time }}</small></div><button v-if="!item.read" @click="markRead(item)">Mark read</button></article><div v-if="!notices.length" class="notice-empty"><Bell /><b>You’re all caught up</b><p>New account and order updates will show here.</p></div></section></main><SiteFooter /></div></template>

<style scoped>
.notice-head{display:flex;justify-content:space-between;align-items:center;margin:24px 0}.notice-head h1{font-size:29px;color:#172841;margin:8px 0}.notice-head h1 span{font-size:11px;vertical-align:middle;background:#fff0e9;color:#f4511e;border-radius:20px;padding:5px 8px}.notice-head p{color:#7b8797;margin:0}.notice-head button,.notice-list article button{display:flex;align-items:center;gap:7px;border:1px solid #dfe5ec;background:#fff;border-radius:8px;color:#34445a;font-weight:700;padding:9px 11px;cursor:pointer}.notice-head button svg{width:16px}.notice-list{background:white;border:1px solid #e7edf3;border-radius:14px;overflow:hidden}.notice-list article{display:flex;align-items:flex-start;gap:14px;padding:19px;border-bottom:1px solid #edf0f4}.notice-list article:last-of-type{border:0}.notice-list article.unread{background:#fffaf7}.notice-icon{flex:none;width:40px;height:40px;border-radius:12px;background:#f2f5f9;color:#425a79;display:grid;place-items:center}.unread .notice-icon{background:#fff0e9;color:#f4511e}.notice-list article>div{flex:1}.notice-list b{color:#1c2b41}.notice-list p{margin:5px 0;color:#64748a;font-size:13px}.notice-list small{color:#929dad;font-size:11px}.notice-list article button{font-size:11px;padding:7px 9px}.notice-empty{text-align:center;padding:65px 15px;color:#738198}.notice-empty svg{color:#f4511e}.notice-empty b{display:block;margin-top:12px;color:#1c2b41}.notice-empty p{font-size:13px}@media(max-width:600px){.notice-head{align-items:flex-start;gap:12px;flex-direction:column}.notice-list article{padding:14px;gap:9px}.notice-list article button{font-size:0}.notice-list article button:after{content:"Read";font-size:11px}}
</style>
