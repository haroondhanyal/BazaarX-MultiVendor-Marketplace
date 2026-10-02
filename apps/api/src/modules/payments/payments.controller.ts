import { PersistentMap } from "../../common/persistent-map";
import { IsIn, IsString } from "class-validator";
import {
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { findMockOrder, persistMockOrder } from "../orders/orders.controller";

class PaymentDto {
  @IsString() orderId!: string;
  @IsIn(["cod", "card", "wallet", "easypaisa", "jazzcash", "installments"])
  method!: string;
}
interface PaymentRecord {
  id: string;
  orderId: string;
  method: string;
  status: "PENDING" | "AUTHORIZED" | "FAILED";
  amount: number;
}
const payments = new PersistentMap<string, PaymentRecord>("payments");
const paymentKeys = new PersistentMap<string, PaymentRecord>("payment-keys");

@Controller("payments")
export class PaymentsController {
  @Post()
  create(@Body() body: PaymentDto, @Headers("idempotency-key") key?: string) {
    if (key && paymentKeys.has(key)) return paymentKeys.get(key);
    const order = findMockOrder(body.orderId);
    if (!order) throw new NotFoundException("Order not found");
    const record: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      orderId: body.orderId,
      method: body.method,
      status: body.method === "cod" ? "PENDING" : "AUTHORIZED",
      amount: order.total,
    };
    payments.set(record.id, record);
    if (record.status === "AUTHORIZED") { order.status = "PLACED"; persistMockOrder(order); }
    if (key) paymentKeys.set(key, record);
    return record;
  }

  @Post(":id/confirm")
  confirm(@Param("id") id: string, @Headers("idempotency-key") key?: string) {
    const payment = payments.get(id);
    if (!payment) throw new NotFoundException("Payment not found");
    if (key && paymentKeys.has(key)) return paymentKeys.get(key);
    payment.status = "AUTHORIZED";
    payments.set(payment.id, payment);
    for (const [key, saved] of paymentKeys) if (saved.id === payment.id) paymentKeys.set(key,payment);
    const order = findMockOrder(payment.orderId);
    if (order) { order.status = "PLACED"; persistMockOrder(order); }
    if (key) paymentKeys.set(key, payment);
    return payment;
  }
}
