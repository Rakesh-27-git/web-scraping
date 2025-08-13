-- CreateTable
CREATE TABLE "public"."Step1Submission" (
    "id" TEXT NOT NULL,
    "aadhaarNumber" VARCHAR(12) NOT NULL,
    "aadhaarName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Step1Submission_pkey" PRIMARY KEY ("id")
);
