import type { Metadata } from "next";
import { BRAND, PLACEHOLDER_IMAGES } from "@/lib/constants";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { MotionSection } from "@/components/shared/MotionSection";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${BRAND.name} for product questions, custom orders, and more.`,
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const product = typeof sp.product === "string" ? sp.product : undefined;
  const type = typeof sp.type === "string" ? sp.type : undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s create something beautiful"
        description="Questions about a piece, a custom idea, or an existing order — we’re here to help."
        image={PLACEHOLDER_IMAGES.hands}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />
      <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_0.85fr]">
        <ContactForm defaultProduct={product} defaultType={type} />
        <MotionSection as="div" className="space-y-6">
          <div className="rounded-[1.75rem] border border-soft-beige bg-gradient-to-br from-powder-blue/50 to-icy-blue p-6">
            <h2 className="font-serif text-2xl">Studio contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-charcoal/70">
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-muted-mauve">
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a href={BRAND.phoneHref} className="hover:text-muted-mauve">
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a
                  href={BRAND.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-muted-mauve"
                >
                  Instagram {BRAND.instagram}
                </a>
              </li>
              <li>
                <a
                  href={BRAND.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-muted-mauve"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
          <p className="font-script text-3xl text-muted-mauve">
            Beautifully handmade. Thoughtfully designed.
          </p>
        </MotionSection>
      </Container>
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.workspace, alt: "Studio" },
            { src: PLACEHOLDER_IMAGES.gift, alt: "Gift" },
            { src: PLACEHOLDER_IMAGES.candle, alt: "Candle" },
            { src: PLACEHOLDER_IMAGES.packaging, alt: "Packaging" },
            { src: PLACEHOLDER_IMAGES.process, alt: "Process" },
          ]}
        />
      </Container>
    </>
  );
}
