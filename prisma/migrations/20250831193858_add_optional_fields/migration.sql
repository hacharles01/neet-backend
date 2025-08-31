/*
  Warnings:

  - The values [RECRUITER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fullName` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `profession1` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `profession2` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `profession3` on the `Application` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primarySkill` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationType` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('KWIGA_IMYUGA', 'GUSHAKIRWA_AKAZI');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'NORMAL');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "fullName",
DROP COLUMN "profession1",
DROP COLUMN "profession2",
DROP COLUMN "profession3",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "otherSkills" TEXT,
ADD COLUMN     "primarySkill" TEXT NOT NULL,
ADD COLUMN     "registrationType" "RegistrationType" NOT NULL,
ADD COLUMN     "secondarySkill" TEXT,
ADD COLUMN     "tertiarySkill" TEXT;
