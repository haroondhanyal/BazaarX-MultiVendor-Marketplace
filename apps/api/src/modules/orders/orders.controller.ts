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
import { activeFlashPrice, calculateVoucher, vouchers } from "../promotions/promotion-data";
import { pushNotification } from "../communication/communication.controller";

class CheckoutItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsOptional() @IsString() flashSaleId?: string;
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
  total: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    seller: string;
    flashSaleId?: string;
  }>;
}
const orders = new Map<string, OrderRecord>();
const checkoutKeys = new Map<string, OrderRecord>();
export function findMockOrder(id: string) {
  return orders.get(id);
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
      if (line.quantity > product.stock)
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      const flash = line.flashSaleId ? activeFlashPrice(line.flashSaleId, product.id, line.quantity) : undefined;
      if (line.flashSaleId && !flash) throw new BadRequestException("The flash sale price is no longer available for this quantity.");
      return { product, quantity: line.quantity, flash };
    });
    const subtotal = lines.reduce(
      (sum, line) => sum + (line.flash?.price ?? line.product.price) * line.quantity,
      0,
    );
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
      total: subtotal + deliveryFee - voucherDiscount,
      items: lines.map(({ product, quantity, flash }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: flash?.price ?? product.price,
        quantity,
        seller: product.seller,
        ...(flash ? { flashSaleId: flash.sale.id } : {}),
      })),
    };
    for (const line of lines) {
      line.product.stock -= line.quantity;
      if (line.flash) line.flash.item.sold += line.quantity;
    }
    if (voucherCodeUsed) {
      const voucher = vouchers.get(voucherCodeUsed);
      if (voucher) voucher.used += 1;
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
    return order;
  }
}
