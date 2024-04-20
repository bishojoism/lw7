/*
  Warnings:

  - You are about to drop the column `keyVefify` on the `Comment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyVerify]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyVerify` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Comment_keyVefify_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "keyVefify",
ADD COLUMN     "keyVerify" BYTEA NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Comment_keyVerify_key" ON "Comment"("keyVerify");
