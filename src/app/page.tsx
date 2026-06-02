"use client";

import { useCallback, useEffect, useState } from "react";
import AccessGate from "@/components/AccessGate";
import Calendar from "@/components/Calendar";

export type Booking = {
  date: string;
  name: string;
  message?: string;
  groupId: string;
};

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsError, setBookingsError] = useState("");
  const [fatal, setFatal] = useState(false);

  const loadBookings = useCallback(async () => {
    setBookingsError("");
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) {
        throw new Error(`bookings HTTP ${res.status}`);
      }
      setBookings(await res.json());
    } catch {
      setBookingsError("Impossible de charger les réservations. Réessaie.");
    }
  }, []);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/session");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setFatal(true);
      return;
    }
    const data = await res.json();
    setAdmin(Boolean(data.admin));
    setAuthed(true);
    await loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    checkSession().catch(() => setFatal(true));
  }, [checkSession]);

  if (fatal) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-3xl border border-white/40 bg-white/90 px-8 py-6 shadow-2xl backdrop-blur-md">
          <p className="text-stone-700">Connexion impossible. Réessaie plus tard.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-stone-800 px-5 py-2.5 font-medium text-white transition hover:bg-stone-900"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  if (authed === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-display text-xl tracking-wide text-white/90 drop-shadow">
          Emma &amp; Mathieu&apos;s Hôtel…
        </p>
      </main>
    );
  }

  if (!authed) {
    return <AccessGate onUnlocked={checkSession} />;
  }

  return (
    <Calendar
      bookings={bookings}
      isAdmin={admin}
      error={bookingsError}
      onChange={loadBookings}
    />
  );
}
