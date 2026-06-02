export type ConciergeLink = {
  href: string;
  emoji: string;
  title: string;
  detail: string;
  highlight?: boolean;
};

export const CONCIERGE_LINKS: ConciergeLink[] = [
  {
    href: "https://www.gov.uk/eta/apply",
    emoji: "🛂",
    title: "Autorisation de voyage (ETA)",
    detail: "Obligatoire pour les ressortissants de l'UE avant de venir. À faire en premier.",
    highlight: true,
  },
  {
    href: "https://www.eurostar.com",
    emoji: "🚄",
    title: "Eurostar",
    detail: "Paris, Lille ou Bruxelles → London St Pancras.",
  },
  {
    href: "https://www.google.com/travel/flights?q=vols%20vers%20Londres",
    emoji: "✈️",
    title: "Vols vers Londres",
    detail: "Comparez les billets d'avion.",
  },
  {
    href: "https://tfl.gov.uk/maps_/tfl-go?intcmp=63185",
    emoji: "🚇",
    title: "Se déplacer à Londres — TfL Go",
    detail: "Itinéraires en transports (paiement sans contact accepté).",
  },
];

export const LUGGAGE_DETAIL =
  "Déposez vos valises en ville avant votre train ou en arrivant.";

export const LUGGAGE_PROVIDERS = [
  { href: "https://www.stasher.com/", label: "Stasher" },
  { href: "https://usebounce.com/fr/luggage-storage/london", label: "Bounce" },
];
