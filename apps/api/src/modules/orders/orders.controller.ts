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
} from "@nestjs/common";
import { catalog } from "../catalog/catalog.controller";

class CheckoutItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
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
  }>;
}
const orders = new Map<string, OrderRecord>();
const checkoutKeys = new Map<string, OrderRecord>();
export function findMockOrder(id: string) {
  return orders.get(id);
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
      return { product, quantity: line.quantity };
    });
    const subtotal = lines.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );
    const deliveryFee =
      body.deliveryMethod === "express" ? 800 : subtotal >= 25000 ? 0 : 350;
    let voucherDiscount = 0;
    if (body.voucherCode) {
      if (body.voucherCode.trim().toUpperCase() !== "BAZAARX10")
        throw new BadRequestException("Voucher is not valid");
      if (subtotal < 10000)
        throw new BadRequestException("Voucher requires a PKR 10,000 minimum subtotal");
      voucherDiscount = Math.min(Math.round(subtotal * 0.1), 5000);
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
      items: lines.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        seller: product.seller,
      })),
    };
    for (const line of lines) line.product.stock -= line.quantity;
    orders.set(order.id, order);
    if (key) checkoutKeys.set(key, order);
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
}
