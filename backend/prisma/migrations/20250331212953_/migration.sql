/*
  Warnings:

  - You are about to drop the column `userId` on the `ProjectMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,profileId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropIndex
DROP INDEX "ProjectMember_projectId_userId_key";

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_profileId_key" ON "ProjectMember"("projectId", "profileId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
