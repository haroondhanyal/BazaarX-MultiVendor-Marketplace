import { PersistentMap } from "../../common/persistent-map";
import { IsArray, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { findMockOrder } from "../orders/orders.controller";
import { pushNotification } from "../communication/communication.controller";

const returns = new PersistentMap<string, ReturnRecord>("returns");
const refunds = new PersistentMap<string, RefundRecord>("refunds");
interface ReturnEvent { status: string; time: string; note: string }
interface ReturnRecord { id: string; orderId: string; productId: string; itemName: string; seller: string; quantity: number; reason: string; description: string; refundMethod: string; refundAmount: number; status: string; createdAt: string; events: ReturnEvent[]; evidence: string[] }
interface RefundRecord { id: string; returnId: string; orderId: string; amount: number; method: string; status: string; createdAt: string }
class CreateReturnDto {
  @IsString() orderId!: string;
  @IsString() productId!: string;
  @IsIn(["damaged", "defective", "wrong item", "missing parts", "size issue", "different item", "other"])
  reason!: string;
  @IsOptional() @IsString() description?: string;
  @IsIn(["original payment", "BazaarX Wallet"]) refundMethod!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) evidence?: string[];
}
class UpdateReturnDto { @IsIn(["APPROVED", "PICKUP_SCHEDULED", "IN_TRANSIT", "RECEIVED", "INSPECTION", "APPROVED_FOR_REFUND", "REJECTED", "REFUNDED"]) status!: string; @IsOptional() @IsString() note?: string; }

@Controller("returns")
export class ReturnsController {
  @Get() list() { return { data: [...returns.values()] }; }
  @Get("refunds") listRefunds() { return { data: [...refunds.values()] }; }
  @Post()
  create(@Body() body: CreateReturnDto) {
    const order = findMockOrder(body.orderId);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status !== "DELIVERED") throw new BadRequestException("A return can be requested after delivery.");
    const item = order.items.find((line) => line.productId === body.productId);
    if (!item) throw new NotFoundException("This product is not part of the order");
    const now = new Date().toISOString();
    const request: ReturnRecord = {
      id: `RET-${Date.now().toString().slice(-8)}`, orderId: order.id, productId: item.productId, itemName: item.name, seller: item.seller,
      quantity: item.quantity, reason: body.reason, description: body.description ?? "", refundMethod: body.refundMethod,
      refundAmount: item.price * item.quantity, status: "REQUESTED", createdAt: now,
      events: [{ status: "REQUESTED", time: now, note: "Return request received." }], evidence: body.evidence ?? [],
    };
    returns.set(request.id, request);
    pushNotification("customer", "return", "Return request received", `Return ${request.id} was submitted.`, "/returns");
    return request;
  }
  @Patch(":returnId/status")
  update(@Param("returnId") returnId: string, @Body() body: UpdateReturnDto) {
    const request = returns.get(returnId);
    if (!request) throw new NotFoundException("Return request not found");
    const allowed: Record<string, string[]> = {
      REQUESTED: ["APPROVED", "REJECTED"], APPROVED: ["PICKUP_SCHEDULED"], PICKUP_SCHEDULED: ["IN_TRANSIT"], IN_TRANSIT: ["RECEIVED"], RECEIVED: ["INSPECTION"], INSPECTION: ["APPROVED_FOR_REFUND", "REJECTED"], APPROVED_FOR_REFUND: ["REFUNDED"],
    };
    if (!allowed[request.status]?.includes(body.status)) throw new BadRequestException(`Cannot change a ${request.status} request to ${body.status}.`);
    request.status = body.status;
    returns.set(returnId,request);
    const time = new Date().toISOString();
    request.events.push({ status: body.status, time, note: body.note ?? body.status.replaceAll("_", " ").toLowerCase() });
    if (body.status === "REFUNDED") {
      const refund: RefundRecord = { id: `RF-${Date.now()}`, returnId, orderId: request.orderId, amount: request.refundAmount, method: request.refundMethod, status: "COMPLETED", createdAt: time };
      refunds.set(refund.id, refund);
    }
    pushNotification("customer", body.status === "REFUNDED" ? "refund" : "return", body.status === "REFUNDED" ? "Refund complete" : "Return update", `${request.id} is now ${body.status.toLowerCase().replaceAll("_", " ")}.`, "/returns");
    return request;
  }
  @Get(":returnId") get(@Param("returnId") returnId: string) { const request = returns.get(returnId); if (!request) throw new NotFoundException("Return request not found"); return request; }
}

export function listMockReturns() { return [...returns.values()]; }
