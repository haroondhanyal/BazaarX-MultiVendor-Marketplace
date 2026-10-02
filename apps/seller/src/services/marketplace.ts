const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!base) throw new Error("VITE_API_URL is not configured.");
  const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = (await response.json()) as T & { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Marketplace request failed.");
  return body;
}

export interface ApiOrder {
  id: string; createdAt: string; status: string; subtotal: number; total: number;
  deliveryFee: number; deliveryMethod: string; address: string;
  items: Array<{ productId: string; name: string; price: number; quantity: number; seller: string }>;
}
export const marketplaceApi = {
  enabled: Boolean(base),
  orders() { return request<{ data: ApiOrder[] }>("/orders"); },
  order(id: string) { return request<ApiOrder>(`/orders/${encodeURIComponent(id)}`); },
  updateOrder(id: string, status: string) { return request<ApiOrder>(`/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  shipmentForOrder(id: string) { return request<Shipment | null>(`/shipments/orders/${encodeURIComponent(id)}`); },
  createShipment(orderId: string) { return request<Shipment>(`/shipments/orders/${encodeURIComponent(orderId)}`, { method: "POST", body: JSON.stringify({ courier: "BazaarX Logistics" }) }); },
  addShipmentEvent(shipmentId: string, status: string, location: string, notes: string) { return request<Shipment>(`/shipments/${encodeURIComponent(shipmentId)}/events`, { method: "PATCH", body: JSON.stringify({ status, location, notes }) }); },
  returns() { return request<{ data: SellerReturn[] }>("/returns"); },
  updateReturn(id: string, status: string, note?: string) { return request<SellerReturn>(`/returns/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }); },
  finance(seller: string) { return request<FinanceSummary>(`/finance/sellers/${encodeURIComponent(seller)}/summary`); },
  analytics(seller: string) { return request<SellerAnalytics>(`/finance/sellers/${encodeURIComponent(seller)}/analytics`); },
  settlements(seller: string) { return request<{ data: Settlement[] }>(`/finance/sellers/${encodeURIComponent(seller)}/settlements`); },
  runSettlement(seller: string) { return request<{ data: Settlement[]; message: string }>("/finance/settlements/run", { method: "POST", body: JSON.stringify({ sellerId: seller }) }); },
  campaigns() { return request<{ data: Campaign[] }>("/promotions/campaigns"); },
  createCampaign(input: Pick<Campaign, "name" | "description" | "startsAt" | "endsAt">) { return request<Campaign>("/promotions/campaigns", { method: "POST", body: JSON.stringify(input) }); },
};

export interface Shipment { id: string; orderId: string; trackingNumber: string; courier: string; status: string; estimatedDelivery: string; events: Array<{ status: string; location: string; time: string; notes: string }> }
export interface SellerReturn { id: string; orderId: string; itemName: string; reason: string; description: string; refundAmount: number; status: string; createdAt: string; events: Array<{status:string;time:string;note:string}>; seller: string }
export interface FinanceSummary { gross: number; commission: number; paymentFees: number; shipping: number; voucherContribution: number; refunds: number; net: number; pendingSettlement: number; paidSettlement: number; orderCount: number }
export interface Settlement { id: string; sellerId: string; periodStart: string; periodEnd: string; status: string; amount: number; orderIds: string[] }
export interface SellerAnalytics { revenue: number; orders: number; averageOrderValue: number; returnRate: number; cancellationRate: number; topProducts: Array<{name:string;revenue:number;units:number;category:string}> }
export interface Campaign { id: string; name: string; description: string; status: string; startsAt: string; endsAt: string; sellerNames: string[] }
