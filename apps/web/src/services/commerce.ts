const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBase) throw new Error("Configure VITE_API_URL to connect to the BazaarX API.");
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = (await response.json()) as T & { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(", ") : result.message || "BazaarX could not complete this request.");
  return result;
}

export const commerceApi = {
  enabled: Boolean(apiBase),
  shipmentForOrder(id: string) { return request<ShipmentRecord | null>(`/shipments/orders/${encodeURIComponent(id)}`); },
  track(trackingNumber: string) { return request<ShipmentRecord>(`/shipments/track/${encodeURIComponent(trackingNumber)}`); },
  validateVoucher(input: { code: string; subtotal: number; productIds: string[] }) { return request<{ code: string; title: string; discount: number }>("/promotions/vouchers/validate", { method: "POST", body: JSON.stringify(input) }); },
  flashSales() { return request<{ data: FlashSale[] }>("/promotions/flash-sales"); },
  submitReturn(input: { orderId: string; productId: string; reason: string; description: string; refundMethod: string; evidence?: string[] }) { return request<ReturnRecord>("/returns", { method: "POST", body: JSON.stringify(input) }); },
  returns() { return request<{ data: ReturnRecord[] }>("/returns"); },
  updateReturn(id: string, status: string, note?: string) { return request<ReturnRecord>(`/returns/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }); },
};

export interface ShipmentRecord {
  id: string;
  orderId: string;
  trackingNumber: string;
  courier: string;
  status: string;
  estimatedDelivery: string;
  events: Array<{ id: string; status: string; location: string; time: string; notes: string }>;
}
export interface FlashSale {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
  items: Array<{ productId: string; normalPrice: number; flashPrice: number; allocatedStock: number; sold: number; perUserLimit: number; product?: { id: string; slug: string; name: string; image: string; seller: string; stock: number; rating: number; reviews: number; category: string; brand: string; price: number; description: string } }>;
}
export interface ReturnRecord {
  id: string;
  orderId: string;
  productId: string;
  itemName: string;
  quantity: number;
  reason: string;
  description: string;
  refundMethod: string;
  refundAmount: number;
  status: string;
  createdAt: string;
  events: Array<{ status: string; time: string; note: string }>;
  evidence: string[];
}
