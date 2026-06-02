import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emma & Mathieu's Hôtel",
  description: "Réservez votre séjour chez nous, à Londres",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={playfair.variable}>
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/london.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-stone-900/55 via-stone-900/45 to-stone-900/70" />
        {children}
      </body>
    </html>
  );
}
