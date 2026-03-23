/*
  Warnings:

  - Added the required column `sentAt` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_roomId_sentAt_idx" ON "Chat"("roomId", "sentAt");
