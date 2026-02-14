-- CreateEnum
CREATE TYPE "roleUser" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "statusWork" AS ENUM ('Draft', 'Published');

-- CreateEnum
CREATE TYPE "typeJourney" AS ENUM ('Education', 'Work', 'Organization');

-- CreateEnum
CREATE TYPE "statusContact" AS ENUM ('Unread', 'Read', 'Replied', 'Archived');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "roleUser" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journeys" (
    "id" SERIAL NOT NULL,
    "type" "typeJourney" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(300) NOT NULL,
    "cover_image" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "content" TEXT,
    "order_index" INTEGER NOT NULL,
    "status" "statusWork" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(300) NOT NULL,
    "cover_image" TEXT NOT NULL,
    "github_url" TEXT,
    "demo_url" TEXT,
    "drive_url" TEXT,
    "published_at" TIMESTAMP(3),
    "status" "statusWork" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50),
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "statusContact" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
