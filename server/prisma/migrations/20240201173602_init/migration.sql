-- CreateIndex
CREATE FULLTEXT INDEX `User_username_email_idx` ON `User`(`username`, `email`);
