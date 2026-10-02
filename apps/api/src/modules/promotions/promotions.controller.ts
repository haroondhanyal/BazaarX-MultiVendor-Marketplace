import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { catalog } from "../catalog/catalog.controller";
import { CampaignRecord, campaigns, calculateVoucher, FlashSaleRecord, flashSales, VoucherRecord, vouchers } from "./promotion-data";

class ValidateVoucherDto { @IsString() code!: string; @IsInt() @Min(0) subtotal!: number; @IsOptional() @IsArray() @IsString({ each: true }) productIds?: string[]; }
class VoucherDto {
  @IsString() @MinLength(3) code!: string;
  @IsString() title!: string;
  @IsIn(["PLATFORM", "CATEGORY", "SELLER", "FREE_SHIPPING"]) type!: VoucherRecord["type"];
  @IsOptional() @IsInt() @Min(1) percentOff?: number;
  @IsOptional() @IsInt() @Min(1) amountOff?: number;
  @IsInt() @Min(0) minimumSpend!: number;
  @IsOptional() @IsInt() @Min(1) maxDiscount?: number;
  @IsOptional() @IsString() category?: string;
  @IsString() startsAt!: string;
  @IsString() endsAt!: string;
  @IsInt() @Min(1) usageLimit!: number;
}
class CampaignDto { @IsString() @MinLength(3) name!: string; @IsString() description!: string; @IsString() startsAt!: string; @IsString() endsAt!: string; @IsOptional() @IsArray() @IsString({ each: true }) sellerNames?: string[]; }
class FlashItemDto { @IsString() productId!: string; @IsInt() @Min(1) flashPrice!: number; @IsInt() @Min(1) allocatedStock!: number; @IsOptional() @IsInt() @Min(1) perUserLimit?: number; }
class FlashSaleDto { @IsString() @MinLength(3) name!: string; @IsDateString() startsAt!: string; @IsDateString() endsAt!: string; @IsArray() @ValidateNested({ each: true }) @Type(() => FlashItemDto) items!: FlashItemDto[]; }

@Controller("promotions")
export class PromotionsController {
  @Get("vouchers") listVouchers() { return { data: [...vouchers.values()] }; }
  @Post("vouchers/validate") validateVoucher(@Body() body: ValidateVoucherDto) {
    const categories = (body.productIds ?? []).map((id) => catalog.find((item) => item.id === id)?.category ?? "");
    const result = calculateVoucher(body.code, body.subtotal, categories);
    if ("error" in result) throw new BadRequestException(result.error);
    return { code: result.voucher.code, discount: result.discount, title: result.voucher.title };
  }
  @Post("vouchers") createVoucher(@Body() body: VoucherDto) {
    const code = body.code.trim().toUpperCase();
    if (vouchers.has(code)) throw new BadRequestException("A voucher with this code already exists.");
    if (Date.parse(body.endsAt) <= Date.parse(body.startsAt)) throw new BadRequestException("Voucher end date must be after its start date.");
    const record: VoucherRecord = { ...body, code, status: Date.parse(body.startsAt) > Date.now() ? "SCHEDULED" : "ACTIVE", used: 0 };
    vouchers.set(code, record);
    return record;
  }
  @Patch("vouchers/:code") updateVoucher(@Param("code") code: string, @Body("status") status: string) {
    const voucher = vouchers.get(code.toUpperCase());
    if (!voucher) throw new NotFoundException("Voucher not found");
    if (!["ACTIVE", "PAUSED", "SCHEDULED"].includes(status)) throw new BadRequestException("Voucher status is not supported.");
    voucher.status = status as VoucherRecord["status"];
    vouchers.set(voucher.code,voucher);
    return voucher;
  }

  @Get("campaigns") listCampaigns() { return { data: [...campaigns.values()] }; }
  @Post("campaigns") createCampaign(@Body() body: CampaignDto) {
    if (Date.parse(body.endsAt) <= Date.parse(body.startsAt)) throw new BadRequestException("Campaign end date must be after its start date.");
    const record: CampaignRecord = { id: `CMP-${Date.now()}`, ...body, sellerNames: body.sellerNames ?? [], status: "PENDING_APPROVAL" };
    campaigns.set(record.id, record);
    return record;
  }
  @Patch("campaigns/:id/status") updateCampaign(@Param("id") id: string, @Body("status") status: string) {
    const campaign = campaigns.get(id);
    if (!campaign) throw new NotFoundException("Campaign not found");
    if (!["ACTIVE", "PAUSED", "SCHEDULED", "PENDING_APPROVAL"].includes(status)) throw new BadRequestException("Campaign status is not supported.");
    campaign.status = status as CampaignRecord["status"];
    campaigns.set(campaign.id,campaign);
    return campaign;
  }

  @Get("flash-sales") listFlashSales() {
    return { data: [...flashSales.values()].map((sale) => ({ ...sale, items: sale.items.map((item) => ({ ...item, product: catalog.find((product) => product.id === item.productId) })) })) };
  }
  @Post("flash-sales") createFlashSale(@Body() body: FlashSaleDto) {
    if (!body.items.length) throw new BadRequestException("Add at least one product to the flash sale.");
    if (Date.parse(body.endsAt) <= Date.parse(body.startsAt)) throw new BadRequestException("Flash sale end date must be after its start date.");
    const items = body.items.map((item) => {
      const product = catalog.find((row) => row.id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (item.flashPrice >= product.price) throw new BadRequestException(`${product.name}: flash price must be below its normal price.`);
      if (item.allocatedStock > product.stock) throw new BadRequestException(`${product.name}: allocated stock exceeds available stock.`);
      return { ...item, normalPrice: product.price, sold: 0, perUserLimit: item.perUserLimit ?? 1 };
    });
    const record: FlashSaleRecord = { id: `FLASH-${Date.now()}`, name: body.name, startsAt: body.startsAt, endsAt: body.endsAt, status: Date.parse(body.startsAt) > Date.now() ? "SCHEDULED" : "ACTIVE", items };
    flashSales.set(record.id, record);
    return record;
  }
  @Patch("flash-sales/:id/status") updateFlashSale(@Param("id") id: string, @Body("status") status: string) {
    const sale = flashSales.get(id);
    if (!sale) throw new NotFoundException("Flash sale not found");
    if (!["ACTIVE", "PAUSED", "SCHEDULED"].includes(status)) throw new BadRequestException("Flash sale status is not supported.");
    sale.status = status as FlashSaleRecord["status"];
    flashSales.set(sale.id,sale);
    return sale;
  }
}
