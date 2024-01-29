/*
  Warnings:

  - Added the required column `userId` to the `Relationship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `relationship` ADD COLUMN `userId` VARCHAR(191) NOT NULL;
