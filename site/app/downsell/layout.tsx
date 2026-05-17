import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Последна оферта — Астро ОС",
  description:
    "Кратки essence анализи на достъпна цена. Идеална стартова точка за твоя астрологичен път.",
  robots: { index: false, follow: false },
};

export default function DownsellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
