import { reactive, watch } from "vue";

export interface SellerProduct {
  id: string;
  title: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Under review";
}
export interface SellerOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "Processing" | "Pending" | "Packed" | "Shipped" | "Delivered";
  date: string;
  shipmentId?: string;
  trackingNumber?: string;
}
function read<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
export const sellerData = reactive({
  loggedIn: read("bx-seller-session", false),
  products: read<SellerProduct[]>("bx-seller-products", [
    {
      id: "SP-1001",
      title: "Nova X Pro Smartphone",
      category: "Mobiles",
      sku: "NOVA-XP-256",
      price: 189999,
      stock: 18,
      status: "Active",
    },
    {
      id: "SP-1002",
      title: "Studio Wireless Headphones",
      category: "Electronics",
      sku: "STUDIO-WH-01",
      price: 12499,
      stock: 42,
      status: "Active",
    },
    {
      id: "SP-1003",
      title: "Pulse Smart Watch Series 4",
      category: "Electronics",
      sku: "PULSE-SW-4",
      price: 8999,
      stock: 6,
      status: "Active",
    },
    {
      id: "SP-1004",
      title: "Everyday Commuter Backpack",
      category: "Fashion",
      sku: "NORTH-BP-22",
      price: 5999,
      stock: 0,
      status: "Under review",
    },
  ]),
  orders: read<SellerOrder[]>("bx-seller-orders", [
    {
      id: "BX-104281",
      customer: "Ayesha Khan",
      product: "Nova X Pro Smartphone",
      amount: 189999,
      status: "Processing",
      date: "2026-10-01",
    },
    {
      id: "BX-104276",
      customer: "Bilal Ahmed",
      product: "Studio Wireless Headphones",
      amount: 12499,
      status: "Pending",
      date: "2026-09-30",
    },
    {
      id: "BX-104268",
      customer: "Sana Malik",
      product: "Pulse Smart Watch Series 4",
      amount: 8999,
      status: "Shipped",
      date: "2026-09-29",
    },
  ]),
});
watch(
  () => sellerData.products,
  (value) => localStorage.setItem("bx-seller-products", JSON.stringify(value)),
  { deep: true },
);
watch(
  () => sellerData.orders,
  (value) => localStorage.setItem("bx-seller-orders", JSON.stringify(value)),
  { deep: true },
);
watch(
  () => sellerData.loggedIn,
  (value) => localStorage.setItem("bx-seller-session", JSON.stringify(value)),
);
export function formatPKR(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
