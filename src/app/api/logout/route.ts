import { NextResponse } from "next/server";
import { clearAccess } from "@/lib/auth";

export async function POST() {
  await clearAccess();
  return NextResponse.json({ ok: true });
}
