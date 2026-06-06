-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'OFFICER');

-- CreateEnum
CREATE TYPE "DriveStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'TECHNICAL', 'HR', 'OFFER_MADE', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roll_no" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "active_backlogs" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "is_placed" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drives" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "ctc_min" DOUBLE PRECISION NOT NULL,
    "ctc_max" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DriveStatus" NOT NULL DEFAULT 'ACTIVE',
    "min_cgpa" DOUBLE PRECISION NOT NULL,
    "allowed_branches" TEXT[],
    "max_backlogs" INTEGER NOT NULL,
    "allowed_years" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "drive_id" TEXT NOT NULL,
    "resume_url" TEXT NOT NULL,
    "current_status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "from_status" "ApplicationStatus" NOT NULL,
    "to_status" "ApplicationStatus" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "note" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_policy" (
    "id" TEXT NOT NULL,
    "one_offer_lock" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_roll_no_key" ON "students"("roll_no");

-- CreateIndex
CREATE UNIQUE INDEX "officers_user_id_key" ON "officers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "officers_employee_id_key" ON "officers"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_student_id_drive_id_key" ON "applications"("student_id", "drive_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
