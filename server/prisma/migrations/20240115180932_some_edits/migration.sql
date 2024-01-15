/*
  Warnings:

  - You are about to drop the column `bio` on the `user` table. All the data in the column will be lost.
  - Added the required column `photoPublicId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `bio`,
    ADD COLUMN `photoPublicId` VARCHAR(191) NOT NULL,
    ALTER COLUMN `profilePhoto` DROP DEFAULT;
