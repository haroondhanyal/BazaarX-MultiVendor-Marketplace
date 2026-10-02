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
  conversations() { return request<{data:SellerConversation[]}>('/conversations?participant=TechStore%20Official'); },
  sendMessage(id: string, text: string) { return request<SellerMessage>(`/conversations/${encodeURIComponent(id)}/messages`, {method:'POST',body:JSON.stringify({text,sender:'seller'})}); },
  markConversationRead(id: string) { return request<{success:boolean}>(`/conversations/${encodeURIComponent(id)}/read?participant=seller`,{method:"PATCH"}); },
  generateListing(input: {title:string;category:string;specifications?:string}) { return request<ListingCopy>('/ai/listing/generate',{method:'POST',body:JSON.stringify(input)}); },
  listingQuality(input: {title:string;category:string;description?:string;images?:string[];specifications?:string}) { return request<{score:number;suggestions:string[]}>('/ai/listing/quality',{method:'POST',body:JSON.stringify(input)}); },
};
export async function uploadProductImage(file: File) {
  if (!base) throw new Error("VITE_API_URL is not configured.");
  const form = new FormData(); form.set("image", file);
  const response = await fetch(`${base}/uploads/image`, {method:"POST",body:form});
  const result = await response.json() as {url?:string;message?:string|string[]};
  if (!response.ok || !result.url) throw new Error(Array.isArray(result.message)?result.message.join(", "):result.message||"Image upload failed.");
  return result.url;
}
export function connectSellerChat() {
  if (!base) return null;
  return io(`${new URL(base).origin}/chat`, { transports: ["websocket", "polling"] });
}

export interface Shipment { id: string; orderId: string; trackingNumber: string; courier: string; status: string; estimatedDelivery: string; events: Array<{ status: string; location: string; time: string; notes: string }> }
export interface SellerReturn { id: string; orderId: string; itemName: string; reason: string; description: string; refundAmount: number; status: string; createdAt: string; events: Array<{status:string;time:string;note:string}>; seller: string }
export interface FinanceSummary { gross: number; commission: number; paymentFees: number; shipping: number; voucherContribution: number; refunds: number; net: number; pendingSettlement: number; paidSettlement: number; orderCount: number }
export interface Settlement { id: string; sellerId: string; periodStart: string; periodEnd: string; status: string; amount: number; orderIds: string[] }
export interface SellerAnalytics { revenue: number; orders: number; averageOrderValue: number; returnRate: number; cancellationRate: number; topProducts: Array<{name:string;revenue:number;units:number;category:string}> }
export interface Campaign { id: string; name: string; description: string; status: string; startsAt: string; endsAt: string; sellerNames: string[] }
export interface SellerMessage { id:string;sender:string;text:string;sentAt:string;read:boolean }
export interface SellerConversation { id:string;buyer:string;seller:string;lastMessage:string;updatedAt:string;online:boolean;typing:string|null;messages:SellerMessage[] }
export interface ListingCopy { provider:string;seoTitle:string;shortDescription:string;description:string;bullets:string[];keywords:string[] }
import { io } from "socket.io-client";
