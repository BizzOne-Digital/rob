import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Stripe success_url lands here; forward to /order-success. */
export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const next = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (typeof v === "string") next.set(k, v);
  });
  redirect(`/order-success${next.toString() ? `?${next}` : ""}`);
}
