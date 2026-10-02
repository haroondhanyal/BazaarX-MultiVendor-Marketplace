const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!base) throw new Error("VITE_API_URL is not configured.");
  const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = (await response.json()) as T & { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Marketplace request failed.");
  return body;
}
export const adminApi = {
  enabled: Boolean(base),
  shipments() { return request<{data: AdminShipment[]}>("/shipments"); },
  updateShipment(id: string, status: string, location: string) { return request<AdminShipment>(`/shipments/${encodeURIComponent(id)}/events`, { method: "PATCH", body: JSON.stringify({ status, location, notes: `Shipment scanned at ${location}.` }) }); },
  returns() { return request<{data: AdminReturn[]}>("/returns"); },
  updateReturn(id: string, status: string) { return request<AdminReturn>(`/returns/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status, note: `Admin advanced return to ${status.toLowerCase().replaceAll("_", " ")}.` }) }); },
  campaigns() { return request<{data: AdminCampaign[]}>("/promotions/campaigns"); },
  createCampaign(input: { name: string; description: string; startsAt: string; endsAt: string }) { return request<AdminCampaign>("/promotions/campaigns", { method: "POST", body: JSON.stringify(input) }); },
  updateCampaign(id: string, status: string) { return request<AdminCampaign>(`/promotions/campaigns/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  vouchers() { return request<{data: AdminVoucher[]}>("/promotions/vouchers"); },
  createVoucher(input: object) { return request<AdminVoucher>("/promotions/vouchers", { method: "POST", body: JSON.stringify(input) }); },
  updateVoucher(code: string, status: string) { return request<AdminVoucher>(`/promotions/vouchers/${encodeURIComponent(code)}`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  flashSales() { return request<{data: AdminFlashSale[]}>("/promotions/flash-sales"); },
  createFlashSale(input: object) { return request<AdminFlashSale>("/promotions/flash-sales", { method: "POST", body: JSON.stringify(input) }); },
  updateFlashSale(id: string, status: string) { return request<AdminFlashSale>(`/promotions/flash-sales/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  analytics() { return request<MarketplaceAnalytics>("/analytics/marketplace"); },
  sellerApplications() { return request<{data:SellerApplication[]}>('/sellers/applications'); },
  decideSellerApplication(id:string,status:"APPROVED"|"REJECTED") { return request<SellerApplication>(`/sellers/applications/${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify({status,note:`Application ${status.toLowerCase()} by Marketplace admin.`})}); },
  tickets() { return request<{data:AdminTicket[]}>('/support/tickets'); },
  createTicket(input: {userId:string;category:string;subject:string;message:string}) { return request<AdminTicket>('/support/tickets',{method:'POST',body:JSON.stringify(input)}); },
  updateTicket(id: string, status: string) { return request<AdminTicket>(`/support/tickets/${encodeURIComponent(id)}/status`, {method:'PATCH',body:JSON.stringify({status})}); },
  commentTicket(id: string, message: string) { return request<AdminTicket>(`/support/tickets/${encodeURIComponent(id)}/comments`, {method:'POST',body:JSON.stringify({author:'BazaarX support',message})}); },
};
export interface AdminShipment { id:string; orderId:string; trackingNumber:string; courier:string; status:string; currentLocation:string; estimatedDelivery:string; events:Array<{status:string;location:string;time:string}> }
export interface AdminReturn { id:string; orderId:string; productId:string; itemName:string; seller:string; reason:string; refundAmount:number; status:string; createdAt:string }
export interface AdminCampaign { id:string; name:string; description:string; status:string; startsAt:string; endsAt:string; sellerNames:string[] }
export interface AdminVoucher { code:string; title:string; type:string; status:string; percentOff?:number; amountOff?:number; minimumSpend:number; used:number; usageLimit:number; endsAt:string }
export interface AdminFlashSale { id:string; name:string; status:string; startsAt:string; endsAt:string; items:Array<{productId:string;flashPrice:number;allocatedStock:number;sold:number;product?:{name:string}}> }
export interface MarketplaceAnalytics { gmv:number;netRevenue:number;orders:number;customers:number;activeSellers:number;averageOrderValue:number;returns:number;refunds:number;commissionRevenue:number }
export interface AdminTicket { id:string;userId:string;category:string;subject:string;message:string;status:string;createdAt:string;comments:Array<{id:string;author:string;message:string;createdAt:string}> }
export interface SellerApplication { id:string;answers:string[];status:"PENDING"|"APPROVED"|"REJECTED";submittedAt:string;updatedAt:string;reviewNote?:string }
