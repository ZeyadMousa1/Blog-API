/*
  Warnings:

  - You are about to drop the `verificationtoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `verificationtoken` DROP FOREIGN KEY `VerificationToken_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `verificationtoken`;
