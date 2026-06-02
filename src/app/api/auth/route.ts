import { NextRequest, NextResponse } from "next/server";
import { grantAccess } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans quelques minutes." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.code !== "string") {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const granted = await grantAccess(body.code);
  if (!granted) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
