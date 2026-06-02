"use client";

import { useState } from "react";
import HotelHeader from "@/components/HotelHeader";

export default function AccessGate({
  onUnlocked,
}: {
  onUnlocked: () => void | Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        await onUnlocked();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Une erreur est survenue, réessaie.");
    } catch {
      setError("Une erreur est survenue, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur-md"
      >
        <HotelHeader variant="dark" />
        <p className="mb-6 mt-5 text-center text-sm text-stone-500">
          Réception — entrez votre code de réservation
        </p>

        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code de réservation"
          autoFocus
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-center text-lg tracking-wide outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
        />

        {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || code.length === 0}
          className="mt-5 w-full rounded-xl bg-stone-800 py-3 font-medium tracking-wide text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Vérification…" : "Check-in"}
        </button>
      </form>
    </main>
  );
}
