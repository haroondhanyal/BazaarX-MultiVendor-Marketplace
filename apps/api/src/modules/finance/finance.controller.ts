import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, BadRequestException } from "@nestjs/common";
import { catalog } from "../catalog/catalog.controller";
import { listMockOrders } from "../orders/orders.controller";
import { listMockReturns } from "../returns/returns.controller";

interface CommissionRule { category: string; rate: number; active: boolean }
interface Settlement { id: string; sellerId: string; periodStart: string; periodEnd: string; createdAt: string; status: "ELIGIBLE" | "SETTLED"; amount: number; orderIds: string[] }
const commissionRules = new Map<string, CommissionRule>([
  ["Mobiles", { category: "Mobiles", rate: 5, active: true }],
  ["Electronics", { category: "Electronics", rate: 5, active: true }],
  ["Fashion", { category: "Fashion", rate: 8, active: true }],
  ["Beauty", { category: "Beauty", rate: 10, active: true }],
]);
const settlements = new Map<string, Settlement>();
const settledItems = new Set<string>();
class SettlementStatusDto { @IsIn(["SETTLED"]) status!: "SETTLED"; }

function withinRange(createdAt: string, from?: string, to?: string) {
  const time = Date.parse(createdAt);
  return (!from || time >= Date.parse(from)) && (!to || time <= Date.parse(to));
}
function rate(category: string) { return commissionRules.get(category)?.rate ?? 8; }
function sellerLines(sellerId: string, from?: string, to?: string) {
  return listMockOrders().filter((order) => withinRange(order.createdAt, from, to)).flatMap((order) => order.items.filter((item) => item.seller.toLowerCase() === decodeURIComponent(sellerId).toLowerCase()).map((item) => ({ order, item, product: catalog.find((p) => p.id === item.productId) })));
}
function netFor(item: { price: number; quantity: number }, category: string, order: { deliveryFee: number; subtotal: number; total: number; paymentMethod: string }) {
  const gross = item.price * item.quantity;
  const commission = Math.round(gross * rate(category) / 100);
  const paymentFee = order.paymentMethod === "cod" ? 0 : Math.round(gross * 0.02);
  const shipping = order.subtotal ? Math.round(order.deliveryFee * gross / order.subtotal) : 0;
  return { gross, commission, paymentFee, shipping, net: gross - commission - paymentFee - shipping };
}

@Controller("finance")
export class FinanceController {
  @Get("commission-rules") listRules() { return { data: [...commissionRules.values()] }; }

  @Get("sellers/:sellerId/summary") summary(@Param("sellerId") sellerId: string, @Query("from") from?: string, @Query("to") to?: string) {
    const lines = sellerLines(sellerId, from, to);
    const totals = lines.reduce((sum, { item, product, order }) => {
      const value = netFor(item, product?.category ?? "", order);
      sum.gross += value.gross; sum.commission += value.commission; sum.paymentFees += value.paymentFee; sum.shipping += value.shipping; sum.net += value.net;
      if (order.status === "DELIVERED") sum.delivered += value.net;
      return sum;
    }, { gross: 0, commission: 0, paymentFees: 0, shipping: 0, net: 0, delivered: 0 });
    const refunds = listMockReturns().filter((item) => item.seller.toLowerCase() === decodeURIComponent(sellerId).toLowerCase() && item.status === "REFUNDED").reduce((sum, item) => sum + item.refundAmount, 0);
    const paid = [...settlements.values()].filter((item) => item.sellerId === decodeURIComponent(sellerId) && item.status === "SETTLED").reduce((sum, item) => sum + item.amount, 0);
    return { sellerId: decodeURIComponent(sellerId), ...totals, refunds, pendingSettlement: Math.max(0, totals.delivered - paid), paidSettlement: paid, orderCount: new Set(lines.map((line) => line.order.id)).size, voucherContribution: lines.reduce((sum, { item, order }) => sum + (order.subtotal ? Math.round((order.voucherDiscount * item.price * item.quantity) / order.subtotal) : 0), 0) };
  }

  @Get("sellers/:sellerId/analytics") analytics(@Param("sellerId") sellerId: string, @Query("from") from?: string, @Query("to") to?: string) {
    const lines = sellerLines(sellerId, from, to);
    const orders = new Map(lines.map(({ order }) => [order.id, order]));
    const products = new Map<string, { name: string; revenue: number; units: number; category: string }>();
    for (const { item, product } of lines) {
      const row = products.get(item.productId) ?? { name: item.name, revenue: 0, units: 0, category: product?.category ?? "Other" };
      row.revenue += item.price * item.quantity; row.units += item.quantity; products.set(item.productId, row);
    }
    const revenue = lines.reduce((sum, { item }) => sum + item.price * item.quantity, 0);
    const returned = listMockReturns().filter((item) => item.seller.toLowerCase() === decodeURIComponent(sellerId).toLowerCase() && item.status !== "REJECTED" && item.status !== "REFUNDED").length;
    const cancelled = [...orders.values()].filter((order) => order.status === "CANCELLED").length;
    return { sellerId: decodeURIComponent(sellerId), revenue, orders: orders.size, averageOrderValue: orders.size ? Math.round(revenue / orders.size) : 0, conversion: 0, returnRate: orders.size ? Math.round(returned / orders.size * 100) : 0, cancellationRate: orders.size ? Math.round(cancelled / orders.size * 100) : 0, topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5) };
  }

  @Get("sellers/:sellerId/settlements") listSellerSettlements(@Param("sellerId") sellerId: string) {
    return { data: [...settlements.values()].filter((item) => item.sellerId === decodeURIComponent(sellerId)) };
  }

  @Get("settlements") listSettlements() { return { data: [...settlements.values()] }; }

  @Post("settlements/run") generateSettlement(@Body("sellerId") sellerId?: string) {
    const sellers = sellerId ? [sellerId] : [...new Set(listMockOrders().flatMap((order) => order.items.map((item) => item.seller)))];
    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(now.getTime() - 7 * 86_400_000).toISOString();
    const created: Settlement[] = [];
    for (const seller of sellers) {
      const eligible = listMockOrders().filter((order) => order.status === "DELIVERED" && withinRange(order.createdAt, periodStart, periodEnd));
      const lines = eligible.flatMap((order) => order.items.filter((item) => item.seller.toLowerCase() === seller.toLowerCase()).map((item) => ({ order, item, product: catalog.find((p) => p.id === item.productId) })));
      const fresh = lines.filter(({ order, item }) => !settledItems.has(`${order.id}:${item.productId}`));
      const amount = fresh.reduce((sum, { order, item, product }) => sum + netFor(item, product?.category ?? "", order).net, 0);
      if (!fresh.length || amount <= 0) continue;
      const settlement: Settlement = { id: `SET-${Date.now()}-${created.length + 1}`, sellerId: seller, periodStart, periodEnd, createdAt: now.toISOString(), status: "ELIGIBLE", amount, orderIds: [...new Set(fresh.map(({ order }) => order.id))] };
      settlements.set(settlement.id, settlement);
      fresh.forEach(({ order, item }) => settledItems.add(`${order.id}:${item.productId}`));
      created.push(settlement);
    }
    return { data: created, message: created.length ? "Weekly settlement batch generated." : "No newly delivered orders are eligible for settlement." };
  }

  @Patch("settlements/:id/status") settle(@Param("id") id: string, @Body() body: SettlementStatusDto) {
    const settlement = settlements.get(id);
    if (!settlement) throw new NotFoundException("Settlement batch not found");
    settlement.status = body.status;
    return settlement;
  }
}

@Controller("analytics")
export class AnalyticsController {
  @Get("marketplace") marketplace(@Query("from") from?: string, @Query("to") to?: string) {
    const orders = listMockOrders().filter((order) => withinRange(order.createdAt, from, to));
    const gmv = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const commissionRevenue = orders.flatMap((order) => order.items.map((item) => ({ order, item, product: catalog.find((p) => p.id === item.productId) }))).reduce((sum, { order, item, product }) => sum + Math.round(item.price * item.quantity * rate(product?.category ?? "") / 100), 0);
    const refunds = listMockReturns().filter((item) => item.status === "REFUNDED").reduce((sum, item) => sum + item.refundAmount, 0);
    return { gmv, netRevenue: gmv - refunds, orders: orders.length, customers: new Set(orders.map((order) => order.address)).size, activeSellers: new Set(orders.flatMap((order) => order.items.map((item) => item.seller))).size, averageOrderValue: orders.length ? Math.round(gmv / orders.length) : 0, returns: listMockReturns().length, refunds, commissionRevenue };
  }
}
