import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [config] = await sql`SELECT evento_nombre, evento_fecha, evento_sede FROM configuracion WHERE id = 1`;
  return NextResponse.json({ config: config || {} });
}
