import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order success",
  description: "Thank you for your order with RW Designs Canada.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const order =
    typeof sp.order === "string"
      ? sp.order
      : typeof sp.orderNumber === "string"
        ? sp.orderNumber
        : undefined;

  return (
    <>
      <Container className="py-20 text-center">
        <p className="font-script text-4xl text-muted-mauve">Thank you</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">
          Your order is confirmed
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-charcoal/65">
          We’ve received your payment details
          {order ? (
            <>
              {" "}
              for order <strong className="text-charcoal">{order}</strong>
            </>
          ) : null}
          . A confirmation email will follow shortly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order ? (
            <Button href={`/order-status?orderNumber=${encodeURIComponent(order)}`}>
              Check order status
            </Button>
          ) : (
            <Button href="/order-status">Check order status</Button>
          )}
          <Button href="/shop" variant="outline">
            Continue shopping
          </Button>
        </div>
        <p className="mt-6 text-sm text-charcoal/50">
          Need help?{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-muted-mauve">
            Contact us
          </Link>
        </p>
      </Container>
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift" },
            { src: PLACEHOLDER_IMAGES.hands, alt: "Handmade" },
            { src: PLACEHOLDER_IMAGES.home, alt: "Home" },
            { src: PLACEHOLDER_IMAGES.sparkle, alt: "Detail" },
          ]}
        />
      </Container>
    </>
  );
}
