import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  const swaggerConfig = new DocumentBuilder()
    .setTitle("BazaarX API")
    .setDescription("BazaarX marketplace API")
    .setVersion("1.0")
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );
  app.enableCors({
    origin: [
      process.env.WEB_ORIGIN ?? "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`BazaarX API listening on http://localhost:${port}/api/v1`);
}
void bootstrap();
