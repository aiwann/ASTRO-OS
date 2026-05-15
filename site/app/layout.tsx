import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import CookieBanner from "@/components/CookieBanner";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Астро ОС — Персонален AI Анализ",
  description:
    "Следващо поколение AI астрология. Персонализирани анализи с дълбочина на часова консултация — готови за минути.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-dark text-parchment antialiased">
        <StarField />
        <Navigation />
        <main className="relative z-10 pt-[7.25rem]">{children}</main>
        <CookieBanner />
      </body>
    </html>
  );
}
