"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/app/page";
import {
  buildMonthGrid,
  datesBetween,
  formatLong,
  monthLabel,
  shiftKey,
  todayKey,
} from "@/lib/date";
import BookingForm from "@/components/BookingForm";
import DayPanel from "@/components/DayPanel";
import HotelHeader from "@/components/HotelHeader";
import UpcomingStays from "@/components/UpcomingStays";
import ConciergeCard from "@/components/ConciergeCard";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function Calendar({
  bookings,
  isAdmin,
  error,
  onChange,
}: {
  bookings: Booking[];
  isAdmin: boolean;
  error: string;
  onChange: () => Promise<void> | void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState("");

  const byDate = useMemo(() => {
    const map = new Map<string, Booking>();
    for (const booking of bookings) {
      map.set(booking.date, booking);
    }
    return map;
  }, [bookings]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = todayKey();

  function resetSelection() {
    setStart(null);
    setEnd(null);
    setSelectionError("");
  }

  function pickFreeDay(key: string) {
    setViewDate(null);
    setSelectionError("");

    if (!start || end) {
      setStart(key);
      setEnd(null);
      return;
    }

    const from = key < start ? key : start;
    const to = key < start ? start : key;
    const overlaps = datesBetween(from, to).some((day) => byDate.has(day));
    if (overlaps) {
      setSelectionError("Ces dates incluent un jour déjà réservé. Choisis une autre plage.");
      setStart(key);
      setEnd(null);
      return;
    }

    setStart(from);
    setEnd(to);
  }

  function openBooked(key: string) {
    resetSelection();
    setViewDate(key);
  }

  function goToPrevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  const selecting = Boolean(start) && !end;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <HotelHeader variant="light" />
          <p className="mt-4 text-center text-sm text-white/80">
            Sélectionnez votre date d&apos;arrivée, puis votre date de départ.
          </p>
        </header>

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              onClick={() => onChange()}
              className="shrink-0 rounded-lg bg-rose-500 px-3 py-1.5 font-medium text-white transition hover:bg-rose-600"
            >
              Réessayer
            </button>
          </div>
        )}

        {selecting && start && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
            <span className="capitalize">
              Arrivée le {formatLong(start)}. Choisis ta date de départ.
            </span>
            <button
              onClick={resetSelection}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Annuler
            </button>
          </div>
        )}

        {selectionError && (
          <div className="mb-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
            {selectionError}
          </div>
        )}

        <div className="rounded-3xl border border-white/40 bg-white/90 p-5 shadow-2xl backdrop-blur-md sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              aria-label="Mois précédent"
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              ‹
            </button>
            <h2 className="text-lg font-medium capitalize text-gray-800">
              {monthLabel(year, month)}
            </h2>
            <button
              onClick={goToNextMonth}
              aria-label="Mois suivant"
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, index) => {
              const booking = cell.inMonth ? byDate.get(cell.key) : undefined;
              const isPast = cell.key < today;
              const isToday = cell.key === today;
              const dayNumber = (
                <span
                  className={isToday ? "rounded-full px-1.5 ring-2 ring-sky-300" : ""}
                >
                  {cell.date.getDate()}
                </span>
              );

              if (booking) {
                const column = index % 7;
                const prev = byDate.get(shiftKey(cell.key, -1));
                const next = byDate.get(shiftKey(cell.key, 1));
                const runStart = column === 0 || prev?.groupId !== booking.groupId;
                const runEnd = column === 6 || next?.groupId !== booking.groupId;
                const left = runStart ? "left-0 rounded-l-xl" : "-left-1";
                const right = runEnd ? "right-0 rounded-r-xl" : "-right-1";

                return (
                  <div key={cell.key} className="group relative aspect-square">
                    <div
                      className={`absolute inset-y-0 bg-rose-100 transition group-hover:bg-rose-200 ${left} ${right}`}
                    />
                    <button
                      onClick={() => openBooked(cell.key)}
                      className="absolute inset-0 flex items-center justify-center text-sm font-medium text-rose-700"
                    >
                      {dayNumber}
                      {runStart && (
                        <span
                          title={booking.name}
                          className="absolute inset-x-0 bottom-1 truncate px-1 text-center text-sm leading-tight"
                        >
                          {booking.name}
                        </span>
                      )}
                    </button>
                  </div>
                );
              }

              const isSelectedStart = cell.key === start && !end;
              const selectable = cell.inMonth && !isPast;

              let look = "text-gray-300";
              if (cell.inMonth && isSelectedStart) {
                look = "bg-emerald-500 font-medium text-white";
              } else if (cell.inMonth && !isPast) {
                look = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
              }

              return (
                <button
                  key={cell.key}
                  disabled={!selectable}
                  onClick={() => pickFreeDay(cell.key)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition disabled:cursor-default ${look}`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-100 ring-1 ring-rose-200" />
              Occupé
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded ring-2 ring-sky-300" />
              Aujourd&apos;hui
            </span>
          </div>
        </div>

        <UpcomingStays bookings={bookings} />
        <ConciergeCard />

        <footer className="mt-8 text-center text-xs tracking-wide text-white/70">
          🗝️ Conciergerie · Londres
          <button
            onClick={logout}
            className="ml-2 underline underline-offset-2 transition hover:text-white"
          >
            Se déconnecter
          </button>
        </footer>
      </div>

      {start && end && (
        <BookingForm
          start={start}
          end={end}
          onClose={resetSelection}
          onChange={onChange}
        />
      )}

      {viewDate && (
        <DayPanel
          date={viewDate}
          bookings={bookings}
          isAdmin={isAdmin}
          onClose={() => setViewDate(null)}
          onChange={onChange}
        />
      )}
    </main>
  );
}
