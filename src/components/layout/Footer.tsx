import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Sparkle } from "lucide-react";
import { BRAND } from "@/lib/constants";

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

export function Footer({
  email,
  phone,
  phoneHref,
  instagramUrl,
  facebookUrl,
}: {
  tagline?: string | null;
  copyright?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneHref?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  showBlog?: boolean;
}) {
  const displayEmail = email || BRAND.email;
  const displayPhone = phone || BRAND.phone;
  const ig = instagramUrl || BRAND.instagramUrl;
  const fb = facebookUrl || BRAND.facebookUrl;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-x-clip bg-[#1a1a1a] text-white">
      <Sparkle className="pointer-events-none absolute bottom-28 left-1/2 h-3 w-3 -translate-x-1/2 text-white/50" />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          <div className="min-w-0 lg:border-r lg:border-white/15 lg:pr-8">
            <Link href="/" className="inline-block max-w-full">
              <Image
                src="/images/brand/rw-designs-canada-logo-clean.png"
                alt={BRAND.name}
                width={200}
                height={200}
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                quality={100}
              />
            </Link>
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-white/70">
              Thoughtfully handmade gifts and home goods made in Canada with
              care.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#b08d9e] hover:text-[#b08d9e]"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#b08d9e] hover:text-[#b08d9e]"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:border-r lg:border-white/15 lg:px-8">
            <h3 className="font-serif text-[18px] text-[#c9a8bb]">
              What We Create
            </h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/80">
              <li>
                <Link href="/what-we-create" className="transition hover:text-white">
                  View All
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-create?sort=newest"
                  className="transition hover:text-white"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-create?featured=1"
                  className="transition hover:text-white"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:border-r lg:border-white/15 lg:px-8">
            <h3 className="font-serif text-[18px] text-[#c9a8bb]">Help</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/80">
              <li>
                <Link href="/faq" className="transition hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-and-returns"
                  className="transition hover:text-white"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-white">
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:pl-8">
            <h3 className="font-serif text-[18px] text-[#c9a8bb]">
              Let’s Connect
            </h3>
            <ul className="mt-4 space-y-3.5 text-[13px] text-white/80">
              <li>
                <a
                  href={`mailto:${displayEmail}`}
                  className="inline-flex items-start gap-2.5 transition hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#b08d9e]" strokeWidth={1.6} />
                  <span className="break-all">{displayEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={phoneHref || BRAND.phoneHref}
                  className="inline-flex items-center gap-2.5 transition hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#b08d9e]" strokeWidth={1.6} />
                  {displayPhone}
                </a>
              </li>
              <li>
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-[#b08d9e]" />
                  {BRAND.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-5">
          <div className="flex flex-col gap-3 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {BRAND.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/privacy-policy" className="transition hover:text-white/80">
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="transition hover:text-white/80"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping-and-returns"
                className="transition hover:text-white/80"
              >
                Shipping & Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
