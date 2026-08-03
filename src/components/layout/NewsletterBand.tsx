"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Sparkle } from "lucide-react";
import { toast } from "sonner";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
          website: "",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not subscribe");
      } else {
        toast.success("You're on the list — thank you!");
        setEmail("");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#e4ebf3]">
      {/* Soft circles + sparkles */}
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-[#d7e2ef]/80 blur-2xl" />
      <Sparkle className="pointer-events-none absolute left-[18%] top-10 h-3 w-3 text-white/90" />
      <Sparkle className="pointer-events-none absolute right-[42%] top-16 h-2.5 w-2.5 text-white/80" />
      <Sparkle className="pointer-events-none absolute bottom-24 left-[40%] h-3 w-3 text-white/70" />

      <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-16">
        <div>
          <h2 className="font-serif text-3xl text-[#2f2c31] sm:text-[2.35rem]">
            A Little Beauty in Your Inbox
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-px w-10 bg-[#c9b4c4]" />
            <Sparkle className="h-3 w-3 text-[#b08d9e]" />
            <span className="h-px w-10 bg-[#c9b4c4]" />
          </div>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#5c5660]">
            Be the first to know about new creations, seasonal favourites, and
            special offers designed just for you.
          </p>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mt-7 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-[#d5dde8] bg-white px-4 shadow-sm">
              <Mail className="h-4 w-4 shrink-0 text-[#9a939b]" strokeWidth={1.75} />
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent text-[14px] text-[#2f2c31] outline-none placeholder:text-[#9a939b]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#b08d9e] px-6 text-[13px] font-semibold text-white transition hover:bg-[#9f7d8e] disabled:opacity-60"
            >
              {loading ? "Joining…" : "Join the List"}
              <Sparkle className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-[480px] overflow-hidden rounded-2xl lg:max-w-none">
          <Image
            src="/images/brand/hero-lifestyle.png"
            alt="Handmade gifts and home fragrance by RW Designs Canada"
            fill
            sizes="(max-width:1024px) 90vw, 480px"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Wavy transition into dark footer */}
      <div className="relative z-20 -mb-px leading-[0]">
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="block h-12 w-full text-[#1a1a1a] sm:h-14"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,40 C180,70 360,10 540,34 C720,58 900,74 1080,48 C1260,22 1380,28 1440,40 L1440,72 L0,72 Z"
          />
        </svg>
        <Sparkle className="pointer-events-none absolute bottom-6 left-[12%] h-3 w-3 text-white/80" />
        <Sparkle className="pointer-events-none absolute bottom-8 right-[28%] h-2.5 w-2.5 text-white/70" />
      </div>
    </section>
  );
}
