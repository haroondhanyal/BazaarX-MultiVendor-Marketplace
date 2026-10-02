import type { MarketplaceOrder } from "@bazaarx/types";

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export interface CheckoutInput {
  items: Array<{ productId: string; quantity: number; flashSaleId?: string }>;
  address: string;
  paymentMethod: string;
  deliveryMethod: string;
  voucherCode?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as T & { message?: string | string[] };
  if (!response.ok) {
    const message = Array.isArray(result.message)
      ? result.message.join(", ")
      : result.message;
    throw new Error(message || "The request could not be completed.");
  }
  return result;
}

export const orderApi = {
  enabled: Boolean(apiBase),
  checkout(input: CheckoutInput) {
    return post<MarketplaceOrder>("/orders/checkout", input);
  },
  createPayment(orderId: string, method: string) {
    return post<{ status: string }>("/payments", { orderId, method });
  },
  async list(): Promise<MarketplaceOrder[]> {
    if (!apiBase) return [];
    const response = await fetch(`${apiBase}/orders`);
    if (!response.ok) throw new Error("Orders could not be loaded.");
    return ((await response.json()) as { data: MarketplaceOrder[] }).data;
  },
  async get(orderId: string): Promise<MarketplaceOrder | undefined> {
    if (!apiBase) return undefined;
    const response = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error("Order details could not be loaded.");
    return (await response.json()) as MarketplaceOrder;
  },
};
