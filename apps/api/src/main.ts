import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppModule } from "./modules/app.module";

// Read the shared workspace .env file without adding a runtime dependency.
try {
  const envFile = readFileSync(resolve(process.cwd(), "../../.env"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch { /* Environment variables may be provided by the host instead. */ }

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
