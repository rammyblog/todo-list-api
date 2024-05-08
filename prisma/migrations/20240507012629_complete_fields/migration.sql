/*
  Warnings:

  - Added the required column `completed` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `completed` BOOLEAN NOT NULL,
    ADD COLUMN `deadline` DATETIME(3) NOT NULL;
