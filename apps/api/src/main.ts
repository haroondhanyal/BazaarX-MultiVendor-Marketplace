import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { flushPersistentMaps, restorePersistentMaps } from "./common/persistent-map";

// Read the shared workspace .env file without adding a runtime dependency.
try {
  const envFile = readFileSync(resolve(process.cwd(), "../../.env"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch { /* Environment variables may be provided by the host instead. */ }

async function bootstrap() {
  const { AppModule } = await import("./modules/app.module");
  let prisma: PrismaClient | undefined;
  if (process.env.PERSISTENCE_DRIVER === "postgres") {
    prisma = new PrismaClient();
    try {
      await prisma.$connect();
      await restorePersistentMaps(prisma);
      console.log("BazaarX PostgreSQL state store connected.");
    } catch (error) {
      console.error("PostgreSQL state store unavailable; using local JSON state.", error);
      await prisma.$disconnect();
      prisma = undefined;
    }
  }
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
  app.enableShutdownHooks();
  if (prisma) app.getHttpServer().once("close", () => { void flushPersistentMaps().finally(() => prisma?.$disconnect()); });
  await app.listen(port);
  console.log(`BazaarX API listening on http://localhost:${port}/api/v1`);
}
void bootstrap();
