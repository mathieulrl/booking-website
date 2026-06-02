import type { Booking } from "@/app/page";
import { formatShort, todayKey } from "@/lib/date";

type Stay = { groupId: string; name: string; start: string; end: string };

function buildUpcomingStays(bookings: Booking[]): Stay[] {
  const groups = new Map<string, { name: string; dates: string[] }>();
  for (const booking of bookings) {
    const group = groups.get(booking.groupId) ?? { name: booking.name, dates: [] };
    group.dates.push(booking.date);
    groups.set(booking.groupId, group);
  }

  const today = todayKey();
  return [...groups.entries()]
    .map(([groupId, group]) => {
      const dates = group.dates.sort();
      return { groupId, name: group.name, start: dates[0], end: dates[dates.length - 1] };
    })
    .filter((stay) => stay.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export default function UpcomingStays({ bookings }: { bookings: Booking[] }) {
  const stays = buildUpcomingStays(bookings);

  return (
    <section className="mt-6 rounded-3xl border border-white/40 bg-white/90 p-5 shadow-2xl backdrop-blur-md sm:p-7">
      <h2 className="font-display text-xl font-semibold text-stone-800">
        Prochaines arrivées
      </h2>

      {stays.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">
          Aucune arrivée prévue pour le moment.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {stays.map((stay) => (
            <li
              key={stay.groupId}
              className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3"
            >
              <span className="font-medium text-rose-700">{stay.name}</span>
              <span className="text-sm text-stone-500">
                {stay.start === stay.end
                  ? formatShort(stay.start)
                  : `${formatShort(stay.start)} → ${formatShort(stay.end)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
