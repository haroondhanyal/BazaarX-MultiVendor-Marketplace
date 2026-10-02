import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { CatalogController } from "./catalog/catalog.controller";
import { AuthController } from "./auth/auth.controller";
import { OrdersController } from "./orders/orders.controller";
import { PaymentsController } from "./payments/payments.controller";
import { InventoryController } from "./inventory/inventory.controller";

@Module({
  controllers: [
    HealthController,
    CatalogController,
    AuthController,
    OrdersController,
    PaymentsController,
    InventoryController,
  ],
})
export class AppModule {}
