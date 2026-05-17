import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Clarity from "@/components/Clarity";

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
  metadataBase: new URL("https://astro-os.net"),
  openGraph: {
    title: "Астро ОС — Персонален AI Астрологичен Анализ",
    description:
      "Персонализирани астрологични анализи, генерирани от AI. PDF доставка в минути. От €5.99.",
    url: "https://astro-os.net",
    siteName: "Астро ОС",
    locale: "bg_BG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Астро ОС — Персонален AI Астрологичен Анализ",
    description:
      "Персонализирани астрологични анализи, генерирани от AI. PDF доставка в минути.",
  },
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
        <Footer />
        <CookieBanner />
        <Clarity />
      </body>
    </html>
  );
}
