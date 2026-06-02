import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAuthed } from "@/lib/auth";
import { getMongo } from "@/lib/mongodb";
import { datesBetween, todayKey } from "@/lib/date";
import { isRateLimited } from "@/lib/rateLimit";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 60;
const MAX_BOOKINGS = 20;
const BOOKINGS_WINDOW_MS = 10 * 60 * 1000;

function isDuplicateKeyError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { collection } = await getMongo();
  const docs = await collection
    .find({}, { projection: { _id: 0, date: 1, name: 1, message: 1, groupId: 1 } })
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(`book:${ip}`, MAX_BOOKINGS, BOOKINGS_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Trop de réservations en peu de temps. Réessaie plus tard." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string" ||
    typeof body.name !== "string"
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const startDate = body.startDate.trim();
  const endDate = body.endDate.trim();
  const name = body.name.trim();
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json(
      { error: "La date de départ doit être après l'arrivée" },
      { status: 400 }
    );
  }
  if (startDate < todayKey()) {
    return NextResponse.json(
      { error: "Impossible de réserver une date passée" },
      { status: 400 }
    );
  }
  if (name.length === 0) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const days = datesBetween(startDate, endDate);
  if (days.length > MAX_DAYS) {
    return NextResponse.json(
      { error: `Un séjour ne peut pas dépasser ${MAX_DAYS} jours` },
      { status: 400 }
    );
  }

  const groupId = randomUUID();
  const createdAt = new Date();
  const docs = days.map((date) => ({ date, name, message, groupId, createdAt }));

  const { client, collection } = await getMongo();
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await collection.insertMany(docs, { session, ordered: true });
    });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "Un ou plusieurs jours de ce séjour sont déjà réservés" },
        { status: 409 }
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
