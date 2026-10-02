import { createRouter, createWebHistory } from "vue-router";
import SellerPortal from "./portal.vue";
import SellerLogin from "./views/SellerLogin.vue";
import SellerDashboard from "./views/SellerDashboard.vue";
import ProductsPage from "./views/ProductsPage.vue";
import ProductForm from "./views/ProductForm.vue";
import InventoryPage from "./views/InventoryPage.vue";
import OrdersPage from "./views/OrdersPage.vue";
import SellerOrderPage from "./views/SellerOrderPage.vue";
import SellerOnboarding from "./views/SellerOnboarding.vue";
import { sellerData } from "./data";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: SellerLogin },
    { path: "/onboarding", component: SellerOnboarding },
    {
      path: "/",
      component: SellerPortal,
      children: [
        { path: "", component: SellerDashboard },
        { path: "products", component: ProductsPage },
        { path: "products/new", component: ProductForm },
        { path: "products/:id/edit", component: ProductForm },
        { path: "inventory", component: InventoryPage },
        { path: "orders", component: OrdersPage },
        { path: "orders/:id", component: SellerOrderPage },
        { path: "finance", component: SellerDashboard },
        { path: "marketing", component: SellerDashboard },
        { path: "analytics", component: SellerDashboard },
        { path: "store", component: SellerDashboard },
        { path: "settings", component: SellerDashboard },
      ],
    },
  ],
});

router.beforeEach((to) => {
  if (to.path !== "/login" && to.path !== "/onboarding" && !sellerData.loggedIn)
    return "/login";
  if (to.path === "/login" && sellerData.loggedIn) return "/";
});
