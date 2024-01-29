/*
  Warnings:

  - You are about to drop the column `followedId` on the `relationship` table. All the data in the column will be lost.
  - Added the required column `followingId` to the `Relationship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `relationship` DROP FOREIGN KEY `Relationship_followedId_fkey`;

-- AlterTable
ALTER TABLE `relationship` DROP COLUMN `followedId`,
    ADD COLUMN `followingId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Relationship` ADD CONSTRAINT `Relationship_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
