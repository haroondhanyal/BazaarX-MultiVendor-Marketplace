<script setup lang="ts">
import { reactive, ref } from "vue";
import { CheckCircle2, Mail, MessageCircle, Send } from "lucide-vue-next";
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { communicationApi, type Ticket } from "../services/communication";

const form = reactive({ name: "", email: "", topic: "General question", message: "" });
const sent = ref(false);
const error = ref("");
const loading = ref(false);

async function sendMessage() {
  error.value = "";
  sent.value = false;
  loading.value = true;
  try {
    const message = `${form.name.trim()} (${form.email.trim()}): ${form.message.trim()}`;
    if (communicationApi.enabled) {
      await communicationApi.createTicket({ category: "technical", subject: form.topic, message });
    } else {
      const saved = JSON.parse(localStorage.getItem("bx-support-tickets") ?? "[]") as Ticket[];
      saved.unshift({ id: `BX-${Date.now().toString().slice(-6)}`, userId: "customer", category: "technical", subject: form.topic, message, createdAt: new Date().toISOString(), status: "OPEN", comments: [] });
      localStorage.setItem("bx-support-tickets", JSON.stringify(saved));
    }
    form.message = "";
    sent.value = true;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Your message could not be sent. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main class="container content-page contact-page">
      <div class="breadcrumb"><RouterLink to="/">Home</RouterLink><span>/</span><span>Contact us</span></div>
      <section class="contact-intro">
        <span class="contact-icon"><MessageCircle /></span>
        <span class="eyebrow">HERE WHEN YOU NEED US</span>
        <h1>Contact BazaarX</h1>
        <p>Send our support team a message. We usually reply within one business day.</p>
      </section>
      <div class="contact-layout">
        <aside class="contact-info">
          <h2>How we can help</h2>
          <p>Questions about an order, payment, return, or your account? Send the details and our team will guide you.</p>
          <RouterLink to="/support"><MessageCircle /> Visit the support center</RouterLink>
          <small><Mail /> Your message is saved as a BazaarX support request.</small>
        </aside>
        <form class="contact-form" @submit.prevent="sendMessage">
          <label>Your name<input v-model="form.name" autocomplete="name" required placeholder="Enter your name" /></label>
          <label>Email address<input v-model="form.email" type="email" autocomplete="email" required placeholder="you@example.com" /></label>
          <label>Topic<select v-model="form.topic"><option>General question</option><option>Order and delivery</option><option>Returns and refunds</option><option>Payments</option><option>Account access</option></select></label>
          <label>Your message<textarea v-model="form.message" rows="5" required minlength="8" placeholder="Tell us how we can help"></textarea></label>
          <p v-if="error" class="contact-error" role="alert">{{ error }}</p>
          <p v-if="sent" class="contact-success" role="status"><CheckCircle2 /> Your message has been sent to BazaarX support.</p>
          <button class="button button-primary" type="submit" :disabled="loading"><Send /> {{ loading ? "Sending…" : "Send message" }}</button>
          <small class="contact-demo-note">Demo mode saves messages locally in this browser.</small>
        </form>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.contact-intro { text-align:center; padding:18px 0 28px; }
.contact-icon { display:grid; place-items:center; width:48px; height:48px; margin:0 auto 13px; border-radius:14px; color:#ed5728; background:#fff0e9; }
.contact-intro h1 { margin:8px 0; color:#192b44; }
.contact-intro p { max-width:520px; margin:0 auto; color:#718096; line-height:1.6; }
.contact-layout { display:grid; grid-template-columns:.8fr 1.2fr; gap:20px; max-width:900px; margin:0 auto; }
.contact-info,.contact-form { padding:24px; border:1px solid #e5eaf0; border-radius:14px; background:var(--surface,#fff); }
.contact-info h2 { margin:0 0 10px; color:#192b44; font-size:19px; }
.contact-info p { color:#718096; line-height:1.65; font-size:14px; }
.contact-info a,.contact-info small { display:flex; align-items:center; gap:8px; margin-top:20px; color:#e85224; font-size:13px; text-decoration:none; }
.contact-info small { color:#718096; line-height:1.5; }
.contact-info svg,.contact-form button svg,.contact-success svg { width:17px; height:17px; flex:none; }
.contact-form { display:grid; gap:14px; }
.contact-form label { display:grid; gap:7px; color:#34445b; font-size:13px; font-weight:700; }
.contact-form input,.contact-form select,.contact-form textarea { width:100%; min-width:0; padding:11px 12px; border:1px solid #dfe5ec; border-radius:8px; color:#27374d; background:var(--surface,#fff); font:inherit; font-weight:400; }
.contact-form textarea { resize:vertical; }
.contact-form button { display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.contact-form button:disabled { opacity:.65; cursor:wait; }
.contact-success,.contact-error { margin:0; font-size:13px; }
.contact-success { display:flex; align-items:center; gap:7px; color:#188859; }
.contact-error { color:#bc3434; }
.contact-demo-note { color:#7e8a9b; font-size:11px; }
@media(max-width:700px) { .contact-layout { grid-template-columns:1fr; gap:12px; } .contact-info,.contact-form { padding:18px; } .contact-intro { padding:10px 0 20px; } }
</style>
