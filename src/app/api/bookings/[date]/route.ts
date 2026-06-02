import { NextResponse } from "next/server";
import { isAdmin, isAuthed } from "@/lib/auth";
import { getMongo } from "@/lib/mongodb";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Seul l'administrateur peut annuler une réservation" },
      { status: 403 }
    );
  }

  const { date } = await params;
  const { collection } = await getMongo();

  const booking = await collection.findOne({ date });
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  await collection.deleteMany({ groupId: booking.groupId });
  return NextResponse.json({ ok: true });
}
