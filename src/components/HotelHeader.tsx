export default function HotelHeader({ variant }: { variant: "light" | "dark" }) {
  const isLight = variant === "light";

  return (
    <div className="text-center">
      <p
        className={`text-xs tracking-[0.4em] ${
          isLight ? "text-amber-200/90" : "text-amber-600"
        }`}
      >
        ★ ★ ★ ★ ★
      </p>
      <h1
        className={`font-display mt-2 font-semibold leading-tight ${
          isLight ? "text-4xl text-white drop-shadow-lg sm:text-5xl" : "text-3xl text-stone-800"
        }`}
      >
        Emma &amp; Mathieu&apos;s
      </h1>
      <p
        className={`font-display mt-1 uppercase ${
          isLight
            ? "text-lg tracking-[0.5em] text-amber-200"
            : "text-sm tracking-[0.45em] text-amber-600"
        }`}
      >
        Hôtel
      </p>
    </div>
  );
}
