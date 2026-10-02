import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { CatalogController } from "./catalog/catalog.controller";
import { AuthController } from "./auth/auth.controller";
import { OrdersController } from "./orders/orders.controller";
import { PaymentsController } from "./payments/payments.controller";
import { InventoryController } from "./inventory/inventory.controller";
import { ShipmentsController } from "./shipments/shipments.controller";
import { ReturnsController } from "./returns/returns.controller";
import { PromotionsController } from "./promotions/promotions.controller";
import { AnalyticsController, FinanceController } from "./finance/finance.controller";
import { ConversationsController, NotificationsController, SupportController } from "./communication/communication.controller";
import { AiController } from "./ai/ai.controller";

@Module({
  controllers: [
    HealthController,
    CatalogController,
    AuthController,
    OrdersController,
    PaymentsController,
    InventoryController,
    ShipmentsController,
    ReturnsController,
    PromotionsController,
    FinanceController,
    AnalyticsController,
    ConversationsController,
    NotificationsController,
    SupportController,
    AiController,
  ],
})
export class AppModule {}
