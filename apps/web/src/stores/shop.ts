import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import type { CartLine, MarketplaceOrder, User } from "@bazaarx/types";
import { products } from "../data/products";

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const useShopStore = defineStore("shop", () => {
  const cart = ref<CartLine[]>(read("bx-cart", []));
  const wishlist = ref<string[]>(read("bx-wishlist", []));
  const user = ref<User | null>(read("bx-user", null));
  const orders = ref<MarketplaceOrder[]>(read("bx-orders", []));
  const selectedPayment = ref(read("bx-payment", "cod"));
  const checkoutAddress = ref(read("bx-checkout-address", ""));
  const deliveryMethod = ref(read("bx-delivery-method", "standard"));
  const voucherDiscount = ref(read("bx-voucher-discount", 0));
  const voucherCode = ref<string>(read("bx-voucher-code", ""));
  const cartCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0),
  );
  const dealDiscount = computed(() => {
    const lines = cart.value.filter((line) => line.dealId === "today-3-for-2");
    let freeItems = Math.floor(lines.reduce((sum, line) => sum + line.quantity, 0) / 3);
    return lines
      .flatMap((line) => Array.from({ length: line.quantity }, () => products.find((product) => product.id === line.productId)?.price ?? 0))
      .sort((a, b) => a - b)
      .slice(0, freeItems)
      .reduce((sum, price) => sum + price, 0);
  });
  const cartTotal = computed(() =>
    Math.max(0, cart.value.reduce(
      (sum, line) =>
        sum +
        (line.promoPrice ?? products.find((p) => p.id === line.productId)?.price ?? 0) *
          line.quantity,
      0,
    ) - dealDiscount.value),
  );
  const savedProducts = computed(() =>
    wishlist.value
      .map((id) => products.find((p) => p.id === id))
      .filter((p) => p !== undefined),
  );
  const cartProducts = computed(() =>
    cart.value
      .map((line) => ({
        product: { ...products.find((p) => p.id === line.productId)!, price: line.promoPrice ?? products.find((p) => p.id === line.productId)!.price },
        quantity: line.quantity,
        color: line.color,
        flashSaleId: line.flashSaleId,
        dealId: line.dealId,
      }))
      .filter((line) => line.product),
  );

  watch(
    cart,
    (value) => localStorage.setItem("bx-cart", JSON.stringify(value)),
    { deep: true },
  );
  watch(
    wishlist,
    (value) => localStorage.setItem("bx-wishlist", JSON.stringify(value)),
    { deep: true },
  );
  watch(
    user,
    (value) =>
      value
        ? localStorage.setItem("bx-user", JSON.stringify(value))
        : localStorage.removeItem("bx-user"),
    { deep: true },
  );
  watch(
    orders,
    (value) => localStorage.setItem("bx-orders", JSON.stringify(value)),
    { deep: true },
  );
  watch(selectedPayment, (value) =>
    localStorage.setItem("bx-payment", JSON.stringify(value)),
  );
  watch(checkoutAddress, (value) =>
    localStorage.setItem("bx-checkout-address", JSON.stringify(value)),
  );
  watch(deliveryMethod, (value) =>
    localStorage.setItem("bx-delivery-method", JSON.stringify(value)),
  );
  watch(voucherDiscount, (value) =>
    localStorage.setItem("bx-voucher-discount", JSON.stringify(value)),
  );
  watch(voucherCode, (value) => localStorage.setItem("bx-voucher-code", JSON.stringify(value)));

  function addToCart(productId: string, flashSaleId?: string, promoPrice?: number, color?: string, dealId?: string) {
    const item = cart.value.find((line) => line.productId === productId && line.color === color && line.dealId === dealId);
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock < 1) return;
    if (item) {
      item.quantity = Math.min(item.quantity + 1, product.stock);
      if (flashSaleId) { item.flashSaleId = flashSaleId; item.promoPrice = promoPrice; }
    } else cart.value.push({ productId, quantity: 1, ...(color ? { color } : {}), ...(flashSaleId ? { flashSaleId, promoPrice } : {}), ...(dealId ? { dealId } : {}) });
  }
  function addDealBundle(productIds: string[]) {
    if (productIds.length !== 3 || new Set(productIds).size !== 3) return;
    for (const productId of productIds) addToCart(productId, undefined, undefined, undefined, "today-3-for-2");
  }
  function setQuantity(productId: string, quantity: number, color?: string, dealId?: string) {
    const line = cart.value.find((item) => item.productId === productId && item.color === color && item.dealId === dealId);
    const product = products.find((p) => p.id === productId);
    if (!line) return;
    if (quantity < 1)
      cart.value = cart.value.filter((item) => item.productId !== productId || item.color !== color || item.dealId !== dealId);
    else line.quantity = Math.min(quantity, product?.stock ?? quantity);
  }
  function toggleWishlist(productId: string) {
    wishlist.value = wishlist.value.includes(productId)
      ? wishlist.value.filter((id) => id !== productId)
      : [...wishlist.value, productId];
  }
  function login(name: string, email: string) {
    user.value = { id: email.toLowerCase(), name, email, role: "customer" };
  }
  function logout() {
    user.value = null;
  }
  function saveOrder(order: MarketplaceOrder) {
    orders.value.unshift(order);
    cart.value = [];
    voucherDiscount.value = 0;
    voucherCode.value = "";
  }
  function updateOrder(order: MarketplaceOrder) {
    const index = orders.value.findIndex((item) => item.id === order.id);
    if (index < 0) orders.value.unshift(order);
    else orders.value[index] = { ...orders.value[index], ...order };
  }
  function createOrder(): MarketplaceOrder | undefined {
    if (!cartProducts.value.length || !checkoutAddress.value.trim())
      return undefined;
    const subtotal = cartTotal.value;
    const deliveryFee =
      deliveryMethod.value === "express" ? 800 : subtotal >= 25000 ? 0 : 350;
    const order: MarketplaceOrder = {
      id: `BX-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: selectedPayment.value === "cod" ? "PLACED" : "PAYMENT_PENDING",
      paymentMethod: selectedPayment.value,
      address: checkoutAddress.value,
      deliveryMethod: deliveryMethod.value,
      subtotal,
      deliveryFee,
      voucherDiscount: voucherDiscount.value,
      dealDiscount: dealDiscount.value || undefined,
      voucherCode: voucherCode.value || undefined,
      total: Math.max(0, subtotal + deliveryFee - voucherDiscount.value),
      items: cartProducts.value.map(({ product, quantity, color, flashSaleId, dealId }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        seller: product.seller,
        ...(color ? { color } : {}),
        ...(flashSaleId ? { flashSaleId } : {}),
        ...(dealId ? { dealId } : {}),
      })),
    };
    saveOrder(order);
    return order;
  }

  return {
    cart,
    wishlist,
    user,
    orders,
    selectedPayment,
    checkoutAddress,
    deliveryMethod,
    voucherDiscount,
    voucherCode,
    cartCount,
    cartTotal,
    dealDiscount,
    savedProducts,
    cartProducts,
    addToCart,
    addDealBundle,
    setQuantity,
    toggleWishlist,
    login,
    logout,
    saveOrder,
    updateOrder,
    createOrder,
  };
});
