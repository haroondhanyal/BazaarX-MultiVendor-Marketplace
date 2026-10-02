import { createRouter, createWebHistory } from "vue-router";
import { useShopStore } from "./stores/shop";
import HomePage from "./views/HomePage.vue";
import SearchPage from "./views/SearchPage.vue";
import ProductPage from "./views/ProductPage.vue";
import WishlistPage from "./views/WishlistPage.vue";
import CartPage from "./views/CartPage.vue";
import LoginPage from "./views/LoginPage.vue";
import SignupPage from "./views/SignupPage.vue";
import AccountPage from "./views/AccountPage.vue";
import PortalShell from "./views/PortalShell.vue";
import CheckoutPage from "./views/CheckoutPage.vue";
import PaymentMethodPage from "./views/PaymentMethodPage.vue";
import CardPaymentPage from "./views/CardPaymentPage.vue";
import PaymentSuccessPage from "./views/PaymentSuccessPage.vue";
import OrderPage from "./views/OrderPage.vue";
import TrackingPage from "./views/TrackingPage.vue";
import ReturnsPage from "./views/ReturnsPage.vue";
import NotificationsPage from "./views/NotificationsPage.vue";
import SupportPage from "./views/SupportPage.vue";
import ContactPage from "./views/ContactPage.vue";
import ChatPage from "./views/ChatPage.vue";
import FlashSalesPage from "./views/FlashSalesPage.vue";
import AssistantPage from "./views/AssistantPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: "/", component: HomePage, meta: { title: "Shop smarter" } },
    {
      path: "/search",
      component: SearchPage,
      meta: { title: "Search products" },
    },
    {
      path: "/category/:slug",
      component: SearchPage,
      meta: { title: "Browse category" },
    },
    {
      path: "/product/:slug",
      component: ProductPage,
      meta: { title: "Product details" },
    },
    { path: "/wishlist", component: WishlistPage, meta: { title: "Wishlist" } },
    { path: "/cart", component: CartPage, meta: { title: "Shopping cart" } },
    { path: "/flash-sales", component: FlashSalesPage, meta: { title: "Flash sales" } },
    { path: "/assistant", component: AssistantPage, meta: { title: "Shopping assistant" } },
    {
      path: "/checkout",
      component: CheckoutPage,
      meta: { title: "Checkout", requiresAuth: true },
    },
    {
      path: "/payment",
      component: PaymentMethodPage,
      meta: { title: "Payment method", requiresAuth: true },
    },
    {
      path: "/payment/card",
      component: CardPaymentPage,
      meta: { title: "Card payment", requiresAuth: true },
    },
    {
      path: "/payment/success",
      component: PaymentSuccessPage,
      meta: { title: "Order confirmed", requiresAuth: true },
    },
    { path: "/login", component: LoginPage, meta: { title: "Sign in" } },
    {
      path: "/signup",
      component: SignupPage,
      meta: { title: "Create account" },
    },
    {
      path: "/account/:section?",
      component: AccountPage,
      meta: { title: "My account" },
    },
    {
      path: "/account/orders/:orderId",
      component: OrderPage,
      meta: { title: "Order details", requiresAuth: true },
    },
    { path: "/orders/:orderId/tracking", component: TrackingPage, meta: { title: "Track order", requiresAuth: true } },
    { path: "/returns", component: ReturnsPage, meta: { title: "Returns and refunds", requiresAuth: true } },
    { path: "/notifications", component: NotificationsPage, meta: { title: "Notifications", requiresAuth: true } },
    { path: "/support", component: SupportPage, meta: { title: "Support center" } },
    { path: "/contact", component: ContactPage, meta: { title: "Contact BazaarX" } },
    { path: "/chat/:seller?", component: ChatPage, meta: { title: "Buyer seller chat", requiresAuth: true } },
    {
      path: "/seller/:pathMatch(.*)*",
      component: PortalShell,
      meta: { title: "Seller Center", portal: "seller" },
    },
    {
      path: "/admin/:pathMatch(.*)*",
      component: PortalShell,
      meta: { title: "Admin Portal", portal: "admin" },
    },
  ],
});

router.beforeEach((to) => {
  document.title = `${String(to.meta.title ?? "BazaarX")} | BazaarX`;
  if (
    (to.path.startsWith("/account") || to.meta.requiresAuth) &&
    !useShopStore().user
  )
    return { path: "/login", query: { next: to.fullPath } };
});
