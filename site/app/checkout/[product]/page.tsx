import { notFound } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";
import { PRODUCT_SLUGS, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((product) => ({ product }));
}

export function generateMetadata({
  params,
}: {
  params: { product: string };
}) {
  const product = getProduct(params.product);
  if (!product) return { title: "Checkout" };
  return {
    title: `Checkout — ${product.title} | Астро Код`,
    description: `Поръчай ${product.title} — ${product.duration}`,
  };
}

export default function CheckoutPage({
  params,
}: {
  params: { product: string };
}) {
  const product = getProduct(params.product);
  if (!product) notFound();
  return <CheckoutClient product={product} />;
}
