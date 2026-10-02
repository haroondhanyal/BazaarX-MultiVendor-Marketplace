import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

type Participant = "buyer" | "seller" | "admin";
interface MessageRecord { id: string; sender: Participant; text: string; sentAt: string; read: boolean; attachmentUrl?: string; productId?: string; orderId?: string }
interface ConversationRecord { id: string; buyer: string; seller: string; lastMessage: string; updatedAt: string; online: boolean; typing: Participant | null; messages: MessageRecord[] }
interface NoticeRecord { id: string; userId: string; type: string; title: string; message: string; createdAt: string; readAt?: string; link?: string }
interface TicketComment { id: string; author: string; message: string; createdAt: string }
interface TicketRecord { id: string; userId: string; category: string; subject: string; message: string; status: string; createdAt: string; comments: TicketComment[] }

const now = new Date().toISOString();
const conversations = new Map<string, ConversationRecord>([["CONV-TECH", { id: "CONV-TECH", buyer: "customer", seller: "TechStore Official", lastMessage: "Thanks for reaching out. How can we help?", updatedAt: now, online: true, typing: null, messages: [{ id: "MSG-1", sender: "buyer", text: "Hi, is this item available?", sentAt: now, read: true }, { id: "MSG-2", sender: "seller", text: "Thanks for reaching out. How can we help?", sentAt: now, read: false }] }]]);
const notifications = new Map<string, NoticeRecord>([["N-1", { id: "N-1", userId: "customer", type: "order", title: "Welcome to BazaarX", message: "Your account is ready. Find something you love from trusted local stores.", createdAt: now }], ["N-2", { id: "N-2", userId: "customer", type: "voucher", title: "New marketplace offers", message: "Check the latest discounts and flash sales.", createdAt: now }]]);
const tickets = new Map<string, TicketRecord>();
export function pushNotification(userId: string, type: string, title: string, message: string, link?: string) {
  const notice: NoticeRecord = { id: `N-${Date.now()}-${notifications.size}`, userId, type, title, message, createdAt: new Date().toISOString(), link };
  notifications.set(notice.id, notice);
  return notice;
}

class StartConversationDto { @IsString() buyer!: string; @IsString() seller!: string; }
class MessageDto { @IsString() @MinLength(1) @MaxLength(2000) text!: string; @IsOptional() @IsString() attachmentUrl?: string; @IsOptional() @IsString() productId?: string; @IsOptional() @IsString() orderId?: string; @IsOptional() @IsIn(["buyer", "seller", "admin"]) sender?: Participant; }
class TypingDto { @IsOptional() @IsIn(["buyer", "seller", "admin"]) participant?: Participant; @IsOptional() typing?: boolean; }
class TicketDto { @IsString() userId!: string; @IsIn(["order", "payment", "return", "refund", "seller", "technical"]) category!: string; @IsString() @MinLength(3) subject!: string; @IsString() @MinLength(5) @MaxLength(3000) message!: string; }
class CommentDto { @IsString() author!: string; @IsString() @MinLength(1) @MaxLength(3000) message!: string; }
class TicketStatusDto { @IsIn(["ASSIGNED", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]) status!: string; }

@Controller("conversations")
export class ConversationsController {
  @Get() list(@Query("participant") participant = "buyer") { return { data: [...conversations.values()].filter((item) => participant === "buyer" || participant === "admin" || item.seller.toLowerCase() === participant.toLowerCase()) }; }
  @Post() start(@Body() body: StartConversationDto) { const existing = [...conversations.values()].find((item) => item.buyer === body.buyer && item.seller === body.seller); if (existing) return existing; const item: ConversationRecord = { id: `CONV-${Date.now()}`, buyer: body.buyer, seller: body.seller, lastMessage: "Start a conversation", updatedAt: new Date().toISOString(), online: true, typing: null, messages: [] }; conversations.set(item.id, item); return item; }
  @Get(":id/messages") messages(@Param("id") id: string) { const item = conversations.get(id); if (!item) throw new NotFoundException("Conversation not found"); return { data: item.messages }; }
  @Post(":id/messages") send(@Param("id") id: string, @Body() body: MessageDto) { const item = conversations.get(id); if (!item) throw new NotFoundException("Conversation not found"); const sender = body.sender ?? "buyer"; const message: MessageRecord = { id: `MSG-${Date.now()}`, sender, text: body.text.trim(), sentAt: new Date().toISOString(), read: false, attachmentUrl: body.attachmentUrl, productId: body.productId, orderId: body.orderId }; item.messages.push(message); item.lastMessage = message.text || "Attachment"; item.updatedAt = message.sentAt; item.typing = null; if (sender === "seller") pushNotification("customer", "chat", `New message from ${item.seller}`, message.text, `/chat/${encodeURIComponent(item.seller)}`); return message; }
  @Patch(":id/read") markRead(@Param("id") id: string, @Query("participant") participant = "buyer") { const item = conversations.get(id); if (!item) throw new NotFoundException("Conversation not found"); item.messages.forEach((message) => { if (message.sender !== participant) message.read = true; }); return { success: true }; }
  @Patch(":id/typing") typing(@Param("id") id: string, @Body() body: TypingDto) { const item = conversations.get(id); if (!item) throw new NotFoundException("Conversation not found"); item.typing = body.typing ? body.participant ?? "buyer" : null; return { typing: item.typing }; }
}

@Controller("notifications")
export class NotificationsController {
  @Get() list(@Query("userId") userId = "customer") { const rows = [...notifications.values()].filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); return { data: rows, unread: rows.filter((item) => !item.readAt).length }; }
  @Patch(":id/read") read(@Param("id") id: string) { const item = notifications.get(id); if (!item) throw new NotFoundException("Notification not found"); item.readAt = new Date().toISOString(); return item; }
  @Patch("read-all") readAll(@Query("userId") userId = "customer") { for (const item of notifications.values()) if (item.userId === userId && !item.readAt) item.readAt = new Date().toISOString(); return { success: true }; }
}

@Controller("support/tickets")
export class SupportController {
  @Get() list(@Query("userId") userId?: string) { return { data: [...tickets.values()].filter((item) => !userId || item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }; }
  @Post() create(@Body() body: TicketDto) { const item: TicketRecord = { id: `TKT-${Date.now()}`, userId: body.userId, category: body.category, subject: body.subject, message: body.message.trim(), status: "OPEN", createdAt: new Date().toISOString(), comments: [] }; tickets.set(item.id, item); pushNotification(body.userId,"support","Support request received",`Ticket ${item.id} is open: ${item.subject}`,"/support"); return item; }
  @Post(":id/comments") comment(@Param("id") id: string, @Body() body: CommentDto) { const item = tickets.get(id); if (!item) throw new NotFoundException("Support ticket not found"); const comment = { id: `C-${Date.now()}`, author: body.author, message: body.message.trim(), createdAt: new Date().toISOString() }; item.comments.push(comment); if (item.status === "WAITING_CUSTOMER") item.status = "IN_PROGRESS"; return comment; }
  @Patch(":id/status") status(@Param("id") id: string, @Body() body: TicketStatusDto) { const item = tickets.get(id); if (!item) throw new NotFoundException("Support ticket not found"); item.status = body.status; pushNotification(item.userId,"support","Support ticket updated",`${item.id} is now ${body.status.toLowerCase().replaceAll("_"," ")}.`,"/support"); return item; }
}
