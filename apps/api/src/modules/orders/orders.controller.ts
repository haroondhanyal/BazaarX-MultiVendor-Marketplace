import { PersistentMap } from "../../common/persistent-map";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  BadRequestException,
  Patch,
} from "@nestjs/common";
import { catalog } from "../catalog/catalog.controller";
import { activeFlashPrice, calculateVoucher, flashSales, vouchers } from "../promotions/promotion-data";
import { pushNotification } from "../communication/communication.controller";
import { saveStock } from "../../common/inventory-state";

class CheckoutItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsOptional() @IsString() flashSaleId?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsIn(["today-3-for-2"]) dealId?: string;
}
class CheckoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
  @IsString() @MinLength(8) address!: string;
  @IsIn(["cod", "card", "wallet", "easypaisa", "jazzcash", "installments"])
  paymentMethod!: string;
  @IsIn(["standard", "express"]) deliveryMethod!: string;
  @IsOptional() @IsString() voucherCode?: string;
}
class OrderStatusDto {
  @IsIn(["SELLER_PROCESSING", "CANCELLED"]) status!: string;
}

interface OrderRecord {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  address: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  voucherDiscount: number;
  dealDiscount?: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    seller: string;
    flashSaleId?: string;
    color?: string;
    dealId?: string;
  }>;
}
const orders = new PersistentMap<string, OrderRecord>("orders");
const checkoutKeys = new PersistentMap<string, OrderRecord>("checkout-keys");
export function findMockOrder(id: string) {
  return orders.get(id);
}

export function persistMockOrder(order: OrderRecord) {
  orders.set(order.id, order);
  for (const [key, saved] of checkoutKeys) {
    if (saved.id === order.id) checkoutKeys.set(key, order);
  }
}
export function listMockOrders() {
  return [...orders.values()];
}

@Controller("orders")
export class OrdersController {
  @Post("checkout")
  checkout(
    @Body() body: CheckoutDto,
    @Headers("idempotency-key") key?: string,
  ) {
    if (key && checkoutKeys.has(key)) return checkoutKeys.get(key);
    const lines = body.items.map((line) => {
      const product = catalog.find((item) => item.id === line.productId);
      if (!product)
        throw new BadRequestException(`Unknown product: ${line.productId}`);
      if (line.color && !product.colors?.includes(line.color))
        throw new BadRequestException(`Color ${line.color} is not available for ${product.name}.`);
      const inActiveFlashSale = [...flashSales.values()].some((sale) =>
        sale.status === "ACTIVE" && Date.now() >= Date.parse(sale.startsAt) && Date.now() <= Date.parse(sale.endsAt) && sale.items.some((item) => item.productId === product.id),
      );
      if (line.dealId && (!product.originalPrice || line.flashSaleId || inActiveFlashSale))
        throw new BadRequestException(`${product.name} is not eligible for the 3 for 2 offer.`);
      if (line.quantity > product.stock)
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      const flash = line.flashSaleId ? activeFlashPrice(line.flashSaleId, product.id, line.quantity) : undefined;
      if (line.flashSaleId && !flash) throw new BadRequestException("The flash sale price is no longer available for this quantity.");
      return { product, quantity: line.quantity, flash, color: line.color, dealId: line.dealId };
    });
    const dealUnits = lines.filter((line) => line.dealId === "today-3-for-2").reduce((sum, line) => sum + line.quantity, 0);
    const freeUnits = Math.floor(dealUnits / 3);
    const dealDiscount = lines
      .filter((line) => line.dealId === "today-3-for-2")
      .flatMap((line) => Array.from({ length: line.quantity }, () => line.flash?.price ?? line.product.price))
      .sort((a, b) => a - b)
      .slice(0, freeUnits)
      .reduce((sum, price) => sum + price, 0);
    const subtotal = lines.reduce(
      (sum, line) => sum + (line.flash?.price ?? line.product.price) * line.quantity,
      0,
    ) - dealDiscount;
    const deliveryFee =
      body.deliveryMethod === "express" ? 800 : subtotal >= 25000 ? 0 : 350;
    let voucherDiscount = 0;
    let voucherCodeUsed: string | undefined;
    if (body.voucherCode) {
      const result = calculateVoucher(body.voucherCode, subtotal, lines.map((line) => line.product.category));
      if ("error" in result) throw new BadRequestException(result.error);
      voucherCodeUsed = result.voucher.code;
      voucherDiscount = result.discount;
    }
    const order: OrderRecord = {
      id: `BX-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: body.paymentMethod === "cod" ? "PLACED" : "PAYMENT_PENDING",
      paymentMethod: body.paymentMethod,
      address: body.address,
      deliveryMethod: body.deliveryMethod,
      subtotal,
      deliveryFee,
      voucherDiscount,
      dealDiscount: dealDiscount || undefined,
      total: subtotal + deliveryFee - voucherDiscount,
      items: lines.map(({ product, quantity, flash, color, dealId }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: flash?.price ?? product.price,
        quantity,
        seller: product.seller,
        ...(color ? { color } : {}),
        ...(dealId ? { dealId } : {}),
        ...(flash ? { flashSaleId: flash.sale.id } : {}),
      })),
    };
    for (const line of lines) {
      line.product.stock -= line.quantity;
      saveStock(line.product.id, line.product.stock);
      if (line.flash) { line.flash.item.sold += line.quantity; flashSales.set(line.flash.sale.id,line.flash.sale); }
    }
    if (voucherCodeUsed) {
      const voucher = vouchers.get(voucherCodeUsed);
      if (voucher) { voucher.used += 1; vouchers.set(voucher.code,voucher); }
    }
    orders.set(order.id, order);
    if (key) checkoutKeys.set(key, order);
    pushNotification("customer", "order", "Order placed", `Order ${order.id} was placed successfully.`, `/account/orders/${order.id}`);
    return order;
  }

  @Get()
  list() {
    return { data: [...orders.values()] };
  }

  @Get(":id")
  get(@Param("id") id: string) {
    const order = orders.get(id);
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: OrderStatusDto) {
    const order = orders.get(id);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status === "DELIVERED" || order.status === "CANCELLED") throw new BadRequestException("This order can no longer be changed.");
    if (body.status === "CANCELLED" && order.status !== "PLACED" && order.status !== "PAYMENT_PENDING") throw new BadRequestException("Only an unprocessed order can be cancelled.");
    if (body.status === "SELLER_PROCESSING" && order.status !== "PLACED") throw new BadRequestException("The seller can only accept a placed order.");
    order.status = body.status;
    orders.set(order.id, order);
    return order;
  }
}
