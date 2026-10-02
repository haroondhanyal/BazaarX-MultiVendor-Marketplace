import { IsInt, Min } from "class-validator";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from "@nestjs/common";
import { catalog } from "../catalog/catalog.controller";

class StockUpdateDto {
  @IsInt() @Min(0) stock!: number;
}

@Controller("inventory")
export class InventoryController {
  @Get()
  list() {
    return {
      data: catalog.map(({ id, name, stock }) => ({
        productId: id,
        product: name,
        available: stock,
      })),
    };
  }

  @Patch(":productId")
  update(@Param("productId") productId: string, @Body() body: StockUpdateDto) {
    const product = catalog.find((item) => item.id === productId);
    if (!product) throw new NotFoundException("Product not found");
    product.stock = body.stock;
    return { productId, available: product.stock };
  }
}
