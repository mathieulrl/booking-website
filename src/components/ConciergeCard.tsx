type ConciergeLink = {
  href: string;
  emoji: string;
  title: string;
  detail: string;
  highlight?: boolean;
};

const LINKS: ConciergeLink[] = [
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

const LUGGAGE_PROVIDERS = [
  { href: "https://www.stasher.com/", label: "Stasher" },
  { href: "https://usebounce.com/fr/luggage-storage/london", label: "Bounce" },
];

const LUGGAGE_DETAIL =
  "Déposez vos valises en ville avant votre train ou en arrivant.";

export default function ConciergeCard() {
  return (
    <section className="mt-6 rounded-3xl border border-white/40 bg-white/90 p-5 shadow-2xl backdrop-blur-md sm:p-7">
      <h2 className="font-display text-xl font-semibold text-stone-800">Conciergerie</h2>
      <p className="mt-1 text-sm text-stone-500">Tout pour préparer votre venue.</p>

      <ul className="mt-4 space-y-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                link.highlight
                  ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                  : "border-stone-100 bg-stone-50 hover:bg-stone-100"
              }`}
            >
              <span className="text-xl leading-none">{link.emoji}</span>
              <span className="min-w-0">
                <span className="block font-medium text-stone-800">{link.title}</span>
                <span className="block text-sm text-stone-500">{link.detail}</span>
              </span>
              <span className="ml-auto text-stone-300">↗</span>
            </a>
          </li>
        ))}

        <li>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">🧳</span>
              <span className="min-w-0">
                <span className="block font-medium text-stone-800">Consigne à bagages</span>
                <span className="block text-sm text-stone-500">{LUGGAGE_DETAIL}</span>
              </span>
            </div>
            <div className="mt-2 flex gap-2 pl-9">
              {LUGGAGE_PROVIDERS.map((provider) => (
                <a
                  key={provider.href}
                  href={provider.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700 transition hover:bg-stone-100"
                >
                  {provider.label} ↗
                </a>
              ))}
            </div>
          </div>
        </li>
      </ul>
    </section>
  );
}
