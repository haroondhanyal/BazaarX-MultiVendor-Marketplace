const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
async function request<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }); const body = await response.json() as T & { message?: string | string[] }; if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "BazaarX could not complete this request."); return body; }
export const intelligenceApi = {
  enabled: Boolean(base),
  assistant(query: string) { return request<AssistantResult>('/ai/assistant', {method:'POST',body:JSON.stringify({query})}); },
  search(query: string) { return request<{query:string;mode:string;data:Product[];total:number}>(`/ai/search?q=${encodeURIComponent(query)}`); },
  generateListing(input: {title:string;category:string;specifications?:string}) { return request<ListingCopy>('/ai/listing/generate',{method:'POST',body:JSON.stringify(input)}); },
  quality(input: {title:string;category:string;description?:string;images?:string[];specifications?:string}) { return request<{score:number;checks:Array<{key:string;label:string;pass:boolean}>;suggestions:string[]}>('/ai/listing/quality',{method:'POST',body:JSON.stringify(input)}); },
  reviewSummary(productId: string) { return request<{productId:string;count:number;sentiment:string;positives:string[];complaints:string[];summary:string}>(`/ai/reviews/summary?productId=${encodeURIComponent(productId)}`); },
  recommendations(productId?: string) { return request<{data:Product[];strategy:string}>(`/ai/recommendations${productId ? `?productId=${encodeURIComponent(productId)}` : ''}`); },
};
export interface Product { id:string;slug:string;name:string;category:string;brand:string;description:string;price:number;originalPrice?:number;rating:number;reviews:number;seller:string;stock:number;image:string;badge?:string;colors?:string[];specifications?:Record<string,string> }
export interface AssistantResult { provider:string;answer:string;criteria:{budget?:number;category?:string;preferences:string};products:Product[] }
export interface ListingCopy { provider:string;seoTitle:string;shortDescription:string;description:string;bullets:string[];keywords:string[] }
