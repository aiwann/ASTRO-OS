import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Специална оферта за теб — Астро ОС",
  description:
    "Разшири своя астрологичен анализ с допълнителни раздели на специална цена.",
  robots: { index: false, follow: false },
};

export default function UpsellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
