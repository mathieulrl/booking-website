import { shiftKey } from "@/lib/date";

function toIcsDate(key: string): string {
  return key.replaceAll("-", "");
}

export function buildIcs({
  start,
  end,
  name,
  stamp,
}: {
  start: string;
  end: string;
  name: string;
  stamp: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Emma & Mathieu's Hotel//FR",
    "BEGIN:VEVENT",
    `UID:${start}-${end}-${stamp}@emma-mathieu-hotel`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
    `DTEND;VALUE=DATE:${toIcsDate(shiftKey(end, 1))}`,
    "SUMMARY:Séjour chez Emma & Mathieu",
    "LOCATION:Londres",
    "DESCRIPTION:Réservation au Emma & Mathieu's Hôtel",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
