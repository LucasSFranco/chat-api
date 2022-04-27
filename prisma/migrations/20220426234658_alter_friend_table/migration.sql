/*
  Warnings:

  - You are about to drop the column `blocked` on the `friends` table. All the data in the column will be lost.
  - You are about to drop the column `pending` on the `friends` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('ACCEPTED', 'PENDING', 'BLOCKED');

-- AlterTable
ALTER TABLE "friends" DROP COLUMN "blocked",
DROP COLUMN "pending",
ADD COLUMN     "sentByMe" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "FriendStatus" NOT NULL DEFAULT E'PENDING';
