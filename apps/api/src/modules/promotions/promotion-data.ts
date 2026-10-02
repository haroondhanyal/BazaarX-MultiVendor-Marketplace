import { PersistentMap } from "../../common/persistent-map";
export interface VoucherRecord {
  code: string;
  title: string;
  type: "PLATFORM" | "CATEGORY" | "SELLER" | "FREE_SHIPPING";
  percentOff?: number;
  amountOff?: number;
  minimumSpend: number;
  maxDiscount?: number;
  category?: string;
  status: "ACTIVE" | "PAUSED" | "SCHEDULED";
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  used: number;
}

export interface FlashSaleRecord {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "SCHEDULED" | "PAUSED";
  items: Array<{ productId: string; normalPrice: number; flashPrice: number; allocatedStock: number; sold: number; perUserLimit: number }>;
}

export interface CampaignRecord {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "SCHEDULED" | "PAUSED";
  sellerNames: string[];
}

const day = 86_400_000;
const today = Date.now();
export const vouchers = new PersistentMap<string, VoucherRecord>("vouchers", [
  ["BAZAARX10", { code: "BAZAARX10", title: "BazaarX 10% off", type: "PLATFORM", percentOff: 10, minimumSpend: 10_000, maxDiscount: 5_000, status: "ACTIVE", startsAt: new Date(today - day).toISOString(), endsAt: new Date(today + 90 * day).toISOString(), usageLimit: 20_000, used: 0 }],
  ["TECHWEEK", { code: "TECHWEEK", title: "Technology week", type: "CATEGORY", percentOff: 15, minimumSpend: 25_000, maxDiscount: 10_000, category: "Electronics", status: "ACTIVE", startsAt: new Date(today - day).toISOString(), endsAt: new Date(today + 30 * day).toISOString(), usageLimit: 2_000, used: 0 }],
]);

export const flashSales = new PersistentMap<string, FlashSaleRecord>("flashSales", [
  ["flash-tech-week", { id: "flash-tech-week", name: "Technology Week Flash Sale", startsAt: new Date(today - day).toISOString(), endsAt: new Date(today + 7 * day).toISOString(), status: "ACTIVE", items: [
    { productId: "p1", normalPrice: 189_999, flashPrice: 174_999, allocatedStock: 8, sold: 0, perUserLimit: 1 },
    { productId: "p2", normalPrice: 12_499, flashPrice: 9_999, allocatedStock: 16, sold: 0, perUserLimit: 2 },
  ] }],
]);

export const campaigns = new PersistentMap<string, CampaignRecord>("campaigns", [
  ["campaign-october-edit", { id: "campaign-october-edit", name: "October Bazaar Edit", description: "Fresh seasonal picks from trusted BazaarX stores.", startsAt: new Date(today - day).toISOString(), endsAt: new Date(today + 14 * day).toISOString(), status: "ACTIVE", sellerNames: ["TechStore Official", "AudioHub"] }],
]);

export function calculateVoucher(code: string, subtotal: number, categoryNames: string[] = []) {
  const voucher = vouchers.get(code.trim().toUpperCase());
  if (!voucher || voucher.status !== "ACTIVE") return { error: "Voucher is not active or does not exist." } as const;
  const now = Date.now();
  if (now < Date.parse(voucher.startsAt) || now > Date.parse(voucher.endsAt)) return { error: "Voucher is outside its valid dates." } as const;
  if (voucher.used >= voucher.usageLimit) return { error: "Voucher usage limit has been reached." } as const;
  if (subtotal < voucher.minimumSpend) return { error: `Voucher requires a PKR ${voucher.minimumSpend.toLocaleString()} minimum subtotal.` } as const;
  if (voucher.category && !categoryNames.includes(voucher.category)) return { error: `Voucher only applies to ${voucher.category}.` } as const;
  const percent = voucher.percentOff ? Math.round(subtotal * voucher.percentOff / 100) : 0;
  const discount = Math.min(percent || voucher.amountOff || 0, voucher.maxDiscount ?? Number.MAX_SAFE_INTEGER);
  return { voucher, discount } as const;
}

export function activeFlashPrice(saleId: string, productId: string, quantity: number) {
  const sale = flashSales.get(saleId);
  if (!sale || sale.status !== "ACTIVE" || Date.now() < Date.parse(sale.startsAt) || Date.now() > Date.parse(sale.endsAt)) return undefined;
  const item = sale.items.find((row) => row.productId === productId);
  if (!item || item.allocatedStock - item.sold < quantity) return undefined;
  return { sale, item, price: item.flashPrice };
}
