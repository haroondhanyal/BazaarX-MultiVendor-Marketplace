import { PersistentMap } from "../../common/persistent-map";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { BadRequestException, Body, Controller, Get, Headers, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { findMockOrder, persistMockOrder } from "../orders/orders.controller";
import { pushNotification } from "../communication/communication.controller";

const shipmentMap = new PersistentMap<string, ShipmentRecord>("shipmentMap");
const shipmentKeys = new PersistentMap<string, ShipmentRecord>("shipment-keys");
interface TrackingEvent { id: string; status: string; location: string; time: string; notes: string }
interface ShipmentRecord { id: string; orderId: string; trackingNumber: string; courier: string; status: string; estimatedDelivery: string; events: TrackingEvent[] }
class CreateShipmentDto { @IsOptional() @IsString() courier?: string; }
class ShipmentEventDto {
  @IsIn(["PACKED", "PICKED_UP", "SORTING_CENTER", "REGIONAL_HUB", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_ATTEMPTED"])
  status!: string;
  @IsString() @MinLength(2) location!: string;
  @IsOptional() @IsString() notes?: string;
}
const labels: Record<string, string> = { PACKED: "Packed", PICKED_UP: "Picked up", SORTING_CENTER: "Sorting center", REGIONAL_HUB: "Regional hub", OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", DELIVERY_ATTEMPTED: "Delivery attempted" };

@Controller("shipments")
export class ShipmentsController {
  @Get()
  list() { return { data: [...shipmentMap.values()].map((shipment) => ({ ...shipment, currentLocation: shipment.events.at(-1)?.location ?? "Awaiting scan" })) }; }

  @Post("orders/:orderId")
  create(@Param("orderId") orderId: string, @Body() body: CreateShipmentDto, @Headers("idempotency-key") key?: string) {
    if (key && shipmentKeys.has(key)) return shipmentKeys.get(key);
    const order = findMockOrder(orderId);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status !== "SELLER_PROCESSING") throw new BadRequestException("Accept the order before creating its shipment.");
    const existing = [...shipmentMap.values()].find((shipment) => shipment.orderId === orderId);
    if (existing) return existing;
    const now = new Date();
    const shipment: ShipmentRecord = {
      id: `SHP-${Date.now()}`,
      orderId,
      trackingNumber: `BXTRK${Date.now().toString().slice(-9)}`,
      courier: body.courier || "BazaarX Logistics",
      status: "PACKED",
      estimatedDelivery: new Date(now.getTime() + (order.deliveryMethod === "express" ? 2 : 5) * 86_400_000).toISOString(),
      events: [
        { id: `${Date.now()}-1`, status: "ORDER_CONFIRMED", location: "Seller store", time: order.createdAt, notes: "Order confirmed by BazaarX." },
        { id: `${Date.now()}-2`, status: "PACKED", location: "Seller dispatch center", time: now.toISOString(), notes: "Package prepared for courier pickup." },
      ],
    };
    order.status = "PACKED";
    persistMockOrder(order);
    shipmentMap.set(shipment.id, shipment);
    if (key) shipmentKeys.set(key, shipment);
    return shipment;
  }

  @Get("orders/:orderId")
  byOrder(@Param("orderId") orderId: string) {
    if (!findMockOrder(orderId)) throw new NotFoundException("Order not found");
    return [...shipmentMap.values()].find((shipment) => shipment.orderId === orderId) ?? null;
  }

  @Get("track/:trackingNumber")
  track(@Param("trackingNumber") trackingNumber: string) {
    const shipment = [...shipmentMap.values()].find((item) => item.trackingNumber === trackingNumber);
    if (!shipment) throw new NotFoundException("Tracking number not found");
    return shipment;
  }

  @Patch(":shipmentId/events")
  addEvent(@Param("shipmentId") shipmentId: string, @Body() body: ShipmentEventDto) {
    const shipment = shipmentMap.get(shipmentId);
    if (!shipment) throw new NotFoundException("Shipment not found");
    const next: Record<string, string[]> = { PACKED: ["PICKED_UP"], PICKED_UP: ["SORTING_CENTER"], SORTING_CENTER: ["REGIONAL_HUB"], REGIONAL_HUB: ["OUT_FOR_DELIVERY"], OUT_FOR_DELIVERY: ["DELIVERY_ATTEMPTED", "DELIVERED"], DELIVERY_ATTEMPTED: ["OUT_FOR_DELIVERY"] };
    if (!next[shipment.status]?.includes(body.status)) throw new BadRequestException(`A ${shipment.status} shipment cannot move to ${body.status}.`);
    const event: TrackingEvent = { id: `${Date.now()}`, status: body.status, location: body.location, time: new Date().toISOString(), notes: body.notes ?? labels[body.status] };
    shipment.events.push(event);
    shipment.status = body.status;
    shipmentMap.set(shipment.id, shipment);
    for (const [key, saved] of shipmentKeys) if (saved.id === shipment.id) shipmentKeys.set(key,shipment);
    const order = findMockOrder(shipment.orderId);
    if (order) { order.status = body.status === "DELIVERED" ? "DELIVERED" : body.status === "OUT_FOR_DELIVERY" || body.status === "PICKED_UP" ? "SHIPPED" : "PACKED"; persistMockOrder(order); }
    if (body.status === "OUT_FOR_DELIVERY" || body.status === "DELIVERED") pushNotification("customer", body.status === "DELIVERED" ? "delivery" : "shipment", body.status === "DELIVERED" ? "Order delivered" : "Out for delivery", `Shipment ${shipment.trackingNumber} is ${body.status.toLowerCase().replaceAll("_", " ")}.`, `/orders/${shipment.orderId}/tracking`);
    return shipment;
  }
}
