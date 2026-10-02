import { createRouter, createWebHistory } from "vue-router";
import AdminPortal from "./portal.vue";
import AdminLogin from "./views/AdminLogin.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import SellersPage from "./views/SellersPage.vue";
import ModerationPage from "./views/ModerationPage.vue";
import AdminOrdersPage from "./views/AdminOrdersPage.vue";
import PaymentsPage from "./views/PaymentsPage.vue";
import AdminToolsPage from "./views/AdminToolsPage.vue";
import { adminData } from "./data";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: AdminLogin },
    {
      path: "/",
      component: AdminPortal,
      children: [
        { path: "", component: AdminDashboard },
        { path: "users", component: AdminToolsPage, meta: { tool: "users" } },
        { path: "sellers", component: SellersPage },
        { path: "moderation", component: ModerationPage },
        { path: "orders", component: AdminOrdersPage },
        { path: "payments", component: PaymentsPage },
        { path: "shipments", component: AdminToolsPage, meta: { tool: "shipments" } },
        { path: "returns", component: AdminToolsPage, meta: { tool: "returns" } },
        { path: "promotions", component: AdminToolsPage, meta: { tool: "promotions" } },
        { path: "vouchers", component: AdminToolsPage, meta: { tool: "vouchers" } },
        { path: "flash-sales", component: AdminToolsPage, meta: { tool: "flash-sales" } },
        { path: "campaigns", component: AdminToolsPage, meta: { tool: "campaigns" } },
        { path: "fraud", component: AdminToolsPage, meta: { tool: "fraud" } },
        { path: "support", component: AdminToolsPage, meta: { tool: "support" } },
        { path: "analytics", component: AdminToolsPage, meta: { tool: "analytics" } },
        { path: "audit-logs", component: AdminToolsPage, meta: { tool: "audit-logs" } },
        { path: "settings", component: AdminToolsPage, meta: { tool: "settings" } },
      ],
    },
  ],
});
router.beforeEach((to) => {
  if (to.path !== "/login" && !adminData.loggedIn) return "/login";
  if (to.path === "/login" && adminData.loggedIn) return "/";
});
