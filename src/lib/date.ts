export function toKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_FR[month]} ${year}`;
}

export type DayCell = { key: string; date: Date; inMonth: boolean };

export function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ key: toKey(date), date, inMonth: date.getMonth() === month });
  }
  return cells;
}

export function shiftKey(key: string, delta: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return toKey(new Date(year, month - 1, day + delta));
}

export function datesBetween(startKey: string, endKey: string): string[] {
  const [sy, sm, sd] = startKey.split("-").map(Number);
  const [ey, em, ed] = endKey.split("-").map(Number);
  const end = new Date(ey, em - 1, ed);
  const keys: string[] = [];
  for (let day = new Date(sy, sm - 1, sd); day <= end; day.setDate(day.getDate() + 1)) {
    keys.push(toKey(day));
  }
  return keys;
}

export function formatShort(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export function formatLong(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
