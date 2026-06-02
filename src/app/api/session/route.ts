import { NextResponse } from "next/server";
import { isAdmin, isAuthed } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({ admin: await isAdmin() });
}
