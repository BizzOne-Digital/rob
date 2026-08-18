import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

const footerLinkClass =
  "inline-block py-1 transition hover:text-taupe focus-visible:outline-none focus-visible:text-taupe";

function FooterSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative w-full border-b border-[#2f2a26]/10 py-6 last:border-b-0 lg:border-b-0 lg:py-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Footer({
  tagline,
  copyright,
  email,
  instagramUrl,
  facebookUrl,
}: {
  tagline?: string | null;
  copyright?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  showBlog?: boolean;
}) {
  const displayEmail = email || BRAND.email;
  const ig = instagramUrl || BRAND.instagramUrl;
  const fb = facebookUrl || BRAND.facebookUrl;
  const year = new Date().getFullYear();
  const displayTagline =
    tagline ||
    "Thoughtfully handmade gifts and home goods made in Canada with care.";
  const displayCopyright =
    copyright || `© ${year} ${BRAND.name}. All rights reserved.`;

  return (
    <footer className="mt-auto border-t border-[#aeb6a6]/70 bg-sage text-[#2f2a26]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-4 lg:items-start lg:gap-0 lg:divide-x lg:divide-[#2f2a26]/15">
          <FooterSection className="text-center lg:pr-8 lg:text-left">
            <BrandLogo href="/" tone="dark" size="sm" />
            <p className="mx-auto mt-4 max-w-[280px] text-[13px] leading-relaxed text-[#2f2a26]/70 lg:mx-0 lg:max-w-[220px]">
              {displayTagline}
            </p>
          </FooterSection>

          <FooterSection className="lg:px-8">
            <h3 className="font-serif text-base text-[#2f2a26]">
              What We Create
            </h3>
            <ul className="mt-3 space-y-1 text-[13px] text-[#2f2a26]/75">
              <li>
                <Link href="/what-we-create" className={footerLinkClass}>
                  View All
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-create?sort=newest"
                  className={footerLinkClass}
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-create?featured=1"
                  className={footerLinkClass}
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Custom Orders
                </Link>
              </li>
            </ul>
          </FooterSection>

          <FooterSection className="lg:px-8">
            <h3 className="font-serif text-base text-[#2f2a26]">Help</h3>
            <ul className="mt-3 space-y-1 text-[13px] text-[#2f2a26]/75">
              <li>
                <Link href="/faq" className={footerLinkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-and-returns"
                  className={footerLinkClass}
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className={footerLinkClass}>
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </FooterSection>

          <FooterSection className="lg:pl-8">
            <h3 className="font-serif text-base text-[#2f2a26]">
              Let&apos;s Connect
            </h3>
            <ul className="mt-3 space-y-2 text-[13px] text-[#2f2a26]/75">
              <li>
                <a
                  href={`mailto:${displayEmail}`}
                  className={`inline-flex items-start gap-2 py-1 ${footerLinkClass}`}
                >
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-taupe"
                    strokeWidth={1.6}
                  />
                  <span className="break-all">{displayEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 py-1 ${footerLinkClass}`}
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-taupe" />
                  {BRAND.instagram}
                </a>
              </li>
            </ul>
            {(ig || fb) && (
              <div className="mt-4 flex items-center gap-2.5">
                {ig ? (
                  <a
                    href={ig}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2f2a26]/20 text-[#2f2a26] transition hover:border-taupe hover:text-taupe"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                ) : null}
                {fb ? (
                  <a
                    href={fb}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2f2a26]/20 text-[#2f2a26] transition hover:border-taupe hover:text-taupe"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            )}
          </FooterSection>
        </div>

        <div className="mt-6 border-t border-[#2f2a26]/15 pt-5 lg:mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-center text-[12px] leading-normal text-[#2f2a26]/55 sm:text-left">
              {displayCopyright}
            </p>
            <nav className="flex flex-col items-center gap-1 text-[12px] text-[#2f2a26]/55 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-4 sm:gap-y-1">
              <Link href="/privacy-policy" className={footerLinkClass}>
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className={footerLinkClass}>
                Terms of Service
              </Link>
              <Link href="/shipping-and-returns" className={footerLinkClass}>
                Shipping & Returns
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
