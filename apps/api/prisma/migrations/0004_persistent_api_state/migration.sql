-- CreateTable
CREATE TABLE "ApiState" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiState_pkey" PRIMARY KEY ("key")
);

