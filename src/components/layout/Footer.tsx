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
    <footer className="relative mt-auto overflow-x-clip border-t border-[#d5baa5]/40 bg-[#2a2420] text-[#f7f1e9]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(177,161,138,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(193,170,162,0.22), transparent 50%)",
        }}
      />
      <Sparkle className="pointer-events-none absolute bottom-28 left-1/2 h-3 w-3 -translate-x-1/2 text-[#d5baa5]/70" />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {/* Brand */}
          <div className="min-w-0 lg:border-r lg:border-[#c5beac]/25 lg:pr-8">
            <Link href="/" className="inline-block max-w-full">
              <Image
                src="/images/brand/rw-designs-canada-logo.png"
                alt={BRAND.name}
                width={140}
                height={140}
                className="h-[4.5rem] w-[4.5rem] rounded-2xl object-cover shadow-[0_10px_28px_rgba(0,0,0,0.25)] ring-1 ring-[#d5baa5]/45 sm:h-24 sm:w-24"
                quality={95}
              />
            </Link>
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-[#e6d9c8]/80">
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c5beac]/35 text-[#e6d9c8] transition hover:border-[#b1a18a] hover:bg-[#b1a18a] hover:text-white"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c5beac]/35 text-[#e6d9c8] transition hover:border-[#b1a18a] hover:bg-[#b1a18a] hover:text-white"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          {/* What We Create */}
          <div className="lg:border-r lg:border-[#c5beac]/25 lg:px-8">
            <h3 className="font-serif text-[18px] text-[#d5baa5]">
              What We Create
            </h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#e6d9c8]/85">
              <li>
                <Link
                  href="/what-we-create"
                  className="transition hover:text-white"
                >
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

          {/* Help */}
          <div className="lg:border-r lg:border-[#c5beac]/25 lg:px-8">
            <h3 className="font-serif text-[18px] text-[#d5baa5]">Help</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#e6d9c8]/85">
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

          {/* Let's Connect */}
          <div className="lg:pl-8">
            <h3 className="font-serif text-[18px] text-[#d5baa5]">
              Let’s Connect
            </h3>
            <ul className="mt-4 space-y-3.5 text-[13px] text-[#e6d9c8]/85">
              <li>
                <a
                  href={`mailto:${displayEmail}`}
                  className="inline-flex items-start gap-2.5 transition hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#b1a18a]" strokeWidth={1.6} />
                  <span className="break-all">{displayEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={phoneHref || BRAND.phoneHref}
                  className="inline-flex items-center gap-2.5 transition hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#b1a18a]" strokeWidth={1.6} />
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
                  <InstagramIcon className="h-4 w-4 shrink-0 text-[#b1a18a]" />
                  {BRAND.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#c5beac]/25 pt-5">
          <div className="flex flex-col gap-3 text-[12px] text-[#c5beac]/80 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {BRAND.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link
                href="/privacy-policy"
                className="transition hover:text-[#e6d9c8]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="transition hover:text-[#e6d9c8]"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping-and-returns"
                className="transition hover:text-[#e6d9c8]"
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
