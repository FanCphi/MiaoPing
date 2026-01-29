-- AlterTable
ALTER TABLE "Order" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "refundAmount" REAL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "refundStatus" TEXT;
