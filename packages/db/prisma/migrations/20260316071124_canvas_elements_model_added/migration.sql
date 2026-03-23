/*
  Warnings:

  - You are about to drop the column `canvas` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "canvas",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "CanvasElements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "CanvasElements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CanvasElements_roomId_idx" ON "CanvasElements"("roomId");

-- CreateIndex
CREATE INDEX "CanvasElements_roomId_zIndex_idx" ON "CanvasElements"("roomId", "zIndex");

-- CreateIndex
CREATE INDEX "CanvasElements_roomId_type_idx" ON "CanvasElements"("roomId", "type");

-- AddForeignKey
ALTER TABLE "CanvasElements" ADD CONSTRAINT "CanvasElements_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
