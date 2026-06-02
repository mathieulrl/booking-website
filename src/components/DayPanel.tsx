"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/app/page";
import { formatLong } from "@/lib/date";

export default function DayPanel({
  date,
  bookings,
  isAdmin,
  onClose,
  onChange,
}: {
  date: string;
  bookings: Booking[];
  isAdmin: boolean;
  onClose: () => void;
  onChange: () => Promise<void> | void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const booking = useMemo(
    () => bookings.find((b) => b.date === date) ?? null,
    [bookings, date]
  );

  const stay = useMemo(() => {
    if (!booking) {
      return null;
    }
    const days = bookings
      .filter((b) => b.groupId === booking.groupId)
      .map((b) => b.date)
      .sort();
    return { start: days[0], end: days[days.length - 1], length: days.length };
  }, [bookings, booking]);

  async function cancel() {
    if (!confirm("Annuler cette réservation ?")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${date}`, { method: "DELETE" });
      if (res.ok) {
        await onChange();
        onClose();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'annulation");
    } catch {
      setError("Une erreur est survenue, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  if (!booking || !stay) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-10 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium capitalize text-gray-800">
            {formatLong(date)}
          </h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-sm text-gray-500">Réservé par</p>
          <p className="text-lg font-medium text-rose-700">{booking.name}</p>
          {stay.length > 1 && (
            <p className="mt-1 text-sm capitalize text-gray-600">
              Séjour&nbsp;: du {formatLong(stay.start)} au {formatLong(stay.end)}
            </p>
          )}
          {booking.message && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
              {booking.message}
            </p>
          )}
        </div>

        {isAdmin ? (
          <button
            onClick={cancel}
            disabled={busy}
            className="w-full rounded-xl border border-rose-200 py-3 font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            {busy ? "…" : "Annuler la réservation"}
          </button>
        ) : (
          <p className="text-center text-xs text-gray-400">
            Seul l&apos;administrateur peut annuler une réservation.
          </p>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}
