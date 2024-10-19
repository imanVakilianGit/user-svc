-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "common";

-- CreateEnum
CREATE TYPE "common"."admin_role_enum" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "common"."active_status_enum" AS ENUM ('ACTIVE', 'DE_ACTIVE', 'BLOCK');

-- CreateEnum
CREATE TYPE "common"."gender_enum" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "common"."admin" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "national_code" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "role" "common"."admin_role_enum" NOT NULL DEFAULT 'ADMIN',
    "active_status" "common"."active_status_enum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."admins_on_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "browser" TEXT NOT NULL,

    CONSTRAINT "admins_on_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."user" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "national_code" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "common"."gender_enum" NOT NULL,
    "active_status" "common"."active_status_enum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."users_on_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "browser" TEXT NOT NULL,

    CONSTRAINT "users_on_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_national_code_key" ON "common"."admin"("national_code");

-- CreateIndex
CREATE UNIQUE INDEX "admin_mobile_number_key" ON "common"."admin"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "common"."admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_on_refresh_tokens_admin_id_key" ON "common"."admins_on_refresh_tokens"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_national_code_key" ON "common"."user"("national_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_mobile_number_key" ON "common"."user"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "common"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_on_refresh_tokens_user_id_key" ON "common"."users_on_refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "common"."admins_on_refresh_tokens" ADD CONSTRAINT "admins_on_refresh_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "common"."admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."users_on_refresh_tokens" ADD CONSTRAINT "users_on_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "common"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
