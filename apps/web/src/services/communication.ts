const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "BazaarX could not complete the request.");
  return body;
}
export const communicationApi = {
  enabled: Boolean(base),
  conversations() { return request<{data: Conversation[]}>('/conversations?participant=buyer'); },
  messages(id: string) { return request<{data: ChatMessage[]}>(`/conversations/${encodeURIComponent(id)}/messages`); },
  start(seller: string) { return request<Conversation>('/conversations', {method:'POST', body:JSON.stringify({buyer:'customer',seller})}); },
  send(id: string, text: string, extras: {productId?: string; orderId?: string; attachmentUrl?: string} = {}) { return request<ChatMessage>(`/conversations/${encodeURIComponent(id)}/messages`, {method:'POST', body:JSON.stringify({text,...extras,sender:'buyer'})}); },
  markRead(id: string) { return request<{success:boolean}>(`/conversations/${encodeURIComponent(id)}/read?participant=buyer`, {method:'PATCH'}); },
  typing(id: string, value: boolean) { return request<{typing:string|null}>(`/conversations/${encodeURIComponent(id)}/typing`, {method:'PATCH', body:JSON.stringify({participant:'buyer',typing:value})}); },
  notifications() { return request<{data: Notice[];unread:number}>('/notifications?userId=customer'); },
  readNotice(id: string) { return request<Notice>(`/notifications/${encodeURIComponent(id)}/read`, {method:'PATCH'}); },
  readAll() { return request<{success:boolean}>('/notifications/read-all?userId=customer', {method:'PATCH'}); },
  tickets() { return request<{data: Ticket[]}>('/support/tickets?userId=customer'); },
  createTicket(input: {category:string; subject:string; message:string}) { return request<Ticket>('/support/tickets', {method:'POST', body:JSON.stringify({...input,userId:'customer'})}); },
};
export interface ChatMessage { id:string; sender:string; text:string; sentAt:string; read:boolean; attachmentUrl?:string; productId?:string; orderId?:string }
export interface Conversation { id:string; buyer:string; seller:string; lastMessage:string; updatedAt:string; online:boolean; typing:string|null; messages:ChatMessage[] }
export interface Notice { id:string; userId:string; type:string; title:string; message:string; createdAt:string; readAt?:string; link?:string }
export interface Ticket { id:string; userId:string; category:string; subject:string; message:string; status:string; createdAt:string; comments:Array<{id:string;author:string;message:string;createdAt:string}> }
