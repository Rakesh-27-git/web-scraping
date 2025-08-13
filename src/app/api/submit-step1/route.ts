import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import schema from "@/data/step1.json";
import { z } from "zod";

// Build Zod schema dynamically from JSON rules
const zodSchema = z.object(
  Object.fromEntries(
    schema.map((f) => [
      f.name,
      z
        .string()
        .min(1, `${f.label} is required`)
        .regex(new RegExp(f.validation?.regex), f.validation?.errorMessage),
    ])
  )
);
type Step1Input = z.infer<typeof zodSchema>;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const parsed = zodSchema.parse(body) as Step1Input;

    const submission = await prisma.step1Submission.create({
      data: {
        aadhaarNumber: parsed["ctl00$ContentPlaceHolder1$txtadharno"],
        aadhaarName: parsed["ctl00$ContentPlaceHolder1$txtownername"],
      },
    });

    return NextResponse.json(
      { message: "Saved successfully", submission },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
