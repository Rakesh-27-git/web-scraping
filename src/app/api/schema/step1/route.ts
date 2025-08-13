// src/app/api/schema/step1/route.ts
import schema from '@/data/step1.json';

export async function GET() {
  return Response.json(schema);
}
