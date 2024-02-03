-- AlterTable
ALTER TABLE `user` ADD COLUMN `PasswordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `PasswordResetTokenExpires` DATETIME(3) NULL;
