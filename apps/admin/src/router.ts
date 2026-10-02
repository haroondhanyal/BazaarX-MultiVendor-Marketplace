import { createRouter, createWebHistory } from "vue-router";
import AdminPortal from "./portal.vue";
import AdminLogin from "./views/AdminLogin.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import SellersPage from "./views/SellersPage.vue";
import ModerationPage from "./views/ModerationPage.vue";
import AdminOrdersPage from "./views/AdminOrdersPage.vue";
import PaymentsPage from "./views/PaymentsPage.vue";
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
        { path: "sellers", component: SellersPage },
        { path: "moderation", component: ModerationPage },
        { path: "orders", component: AdminOrdersPage },
        { path: "payments", component: PaymentsPage },
      ],
    },
  ],
});
router.beforeEach((to) => {
  if (to.path !== "/login" && !adminData.loggedIn) return "/login";
  if (to.path === "/login" && adminData.loggedIn) return "/";
});
