-- DropForeignKey
ALTER TABLE `relationship` DROP FOREIGN KEY `Relationship_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `relationship` DROP FOREIGN KEY `Relationship_followingId_fkey`;

-- AddForeignKey
ALTER TABLE `Relationship` ADD CONSTRAINT `Relationship_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relationship` ADD CONSTRAINT `Relationship_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
