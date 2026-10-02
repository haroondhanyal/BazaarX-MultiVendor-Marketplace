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
import { saveStock, savedStock } from "../../common/inventory-state";

for (const product of catalog) {
  const stock = savedStock(product.id);
  if (stock !== undefined) product.stock = stock;
}

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
    saveStock(product.id,body.stock);
    return { productId, available: product.stock };
  }
}
