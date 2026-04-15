/*
  Warnings:

  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" RENAME COLUMN "created_at" TO "createdAt";
