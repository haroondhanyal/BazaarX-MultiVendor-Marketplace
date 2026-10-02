import { reactive, watch } from "vue";
export interface AdminSeller {
  id: string;
  name: string;
  location: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
}
export interface ReviewProduct {
  id: string;
  name: string;
  seller: string;
  category: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
}
export interface AdminOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  payment: string;
  date: string;
}
function read<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
export const adminData = reactive({
  loggedIn: read("bx-admin-session", false),
  sellers: read<AdminSeller[]>("bx-admin-sellers", [
    {
      id: "S-2201",
      name: "Maple Home Store",
      location: "Karachi",
      submitted: "2026-10-01",
      status: "Pending",
    },
    {
      id: "S-2202",
      name: "Urban Thread Co.",
      location: "Lahore",
      submitted: "2026-09-30",
      status: "Pending",
    },
    {
      id: "S-2203",
      name: "AudioHub Official",
      location: "Islamabad",
      submitted: "2026-09-28",
      status: "Approved",
    },
  ]),
  products: read<ReviewProduct[]>("bx-admin-reviews", [
    {
      id: "M-701",
      name: "Handmade ceramic table set",
      seller: "Maple Home Store",
      category: "Home & Living",
      submitted: "2026-10-01",
      status: "Pending",
    },
    {
      id: "M-702",
      name: "Classic leather wallet",
      seller: "Urban Thread Co.",
      category: "Fashion",
      submitted: "2026-09-30",
      status: "Pending",
    },
    {
      id: "M-703",
      name: "USB-C fast charger 30W",
      seller: "AudioHub Official",
      category: "Electronics",
      submitted: "2026-09-29",
      status: "Approved",
    },
  ]),
  orders: read<AdminOrder[]>("bx-admin-orders", [
    {
      id: "BX-104281",
      customer: "Ayesha Khan",
      total: 189999,
      status: "Processing",
      payment: "COD · Pending",
      date: "2026-10-01",
    },
    {
      id: "BX-104276",
      customer: "Bilal Ahmed",
      total: 12499,
      status: "Payment pending",
      payment: "Card · Authorized",
      date: "2026-09-30",
    },
    {
      id: "BX-104268",
      customer: "Sana Malik",
      total: 8999,
      status: "Shipped",
      payment: "Wallet · Paid",
      date: "2026-09-29",
    },
  ]),
});
watch(
  () => adminData.loggedIn,
  (value) => localStorage.setItem("bx-admin-session", JSON.stringify(value)),
);
watch(
  () => adminData.sellers,
  (value) => localStorage.setItem("bx-admin-sellers", JSON.stringify(value)),
  { deep: true },
);
watch(
  () => adminData.products,
  (value) => localStorage.setItem("bx-admin-reviews", JSON.stringify(value)),
  { deep: true },
);
watch(
  () => adminData.orders,
  (value) => localStorage.setItem("bx-admin-orders", JSON.stringify(value)),
  { deep: true },
);
export function formatPKR(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
