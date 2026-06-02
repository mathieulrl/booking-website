"use client";

import { useState } from "react";
import { datesBetween, formatLong } from "@/lib/date";
import { buildIcs } from "@/lib/ics";

export default function BookingForm({
  start,
  end,
  onClose,
  onChange,
}: {
  start: string;
  end: string;
  onClose: () => void;
  onChange: () => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const dayCount = datesBetween(start, end).length;
  const isSingleDay = start === end;
  const stayLabel = isSingleDay
    ? formatLong(start)
    : `Du ${formatLong(start)} au ${formatLong(end)}`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: start, endDate: end, name, message }),
      });
      if (res.ok) {
        await onChange();
        setConfirmed(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la réservation");
    } catch {
      setError("Une erreur est survenue, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  function downloadIcs() {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = buildIcs({ start, end, name: name.trim(), stamp });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sejour-emma-mathieu.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-10 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-semibold text-stone-800">
            {confirmed ? "Réservation confirmée" : "Votre séjour"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <span className="capitalize">{stayLabel}</span>
          <span className="mt-1 block text-xs text-emerald-600">
            {isSingleDay ? "Visite d'une journée" : `Séjour de ${dayCount} jours`}
          </span>
        </div>

        {confirmed ? (
          <>
            <p className="text-sm text-stone-600">
              À très bientôt, {name.trim()} 🗝️ Pensez à ajouter votre séjour à votre
              agenda.
            </p>
            <button
              type="button"
              onClick={downloadIcs}
              className="w-full rounded-xl border border-stone-200 py-3 font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Ajouter à mon agenda
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-stone-800 py-3 font-medium text-white transition hover:bg-stone-900"
            >
              Fermer
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              autoFocus
              maxLength={60}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Un petit mot (optionnel)"
              rows={3}
              maxLength={300}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || name.trim().length === 0}
              className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Réservation…" : "Réserver la chambre"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
