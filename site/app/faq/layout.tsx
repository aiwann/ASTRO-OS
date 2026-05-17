import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Въпроси и отговори — Астро ОС",
  description:
    "Отговори на често задавани въпроси за нашите AI астрологични анализи — доставка, точност, поверителност.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
