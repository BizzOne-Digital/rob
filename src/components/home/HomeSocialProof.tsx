"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  _id: string;
  customerName: string;
  reviewText: string;
  rating?: number | null;
  productName?: string | null;
  reviewDate?: string | null;
};

type Faq = {
  _id: string;
  question: string;
  answer: string;
};

export function HomeSocialProof({
  testimonials,
  faqs,
}: {
  testimonials: Testimonial[];
  faqs: Faq[];
}) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?._id ?? null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const visibleFaqs = faqs.slice(0, 5);
  const visibleTestimonials = testimonials.slice(0, 8);
  const current = visibleTestimonials[active];

  useEffect(() => {
    if (visibleTestimonials.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % visibleTestimonials.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [visibleTestimonials.length, paused]);

  return (
    <section className="overflow-x-clip bg-[#e8eef4] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
        {/* Testimonials */}
        <div className="min-w-0">
          <h2 className="font-serif text-[1.85rem] text-[#2f2c31] sm:text-3xl lg:text-[2rem]">
            Kind Words, Meaningful Moments
          </h2>
          <p className="mt-2 text-[14px] text-[#6B5B5B]">
            Notes from customers who chose handmade.
          </p>

          {visibleTestimonials.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#d9e0ea] bg-white/70 p-6 text-sm text-[#6B5B5B]">
              Approved testimonials will appear here once published in the
              admin portal.
            </div>
          ) : (
            <div
              className="relative mt-6 min-h-[240px] overflow-hidden rounded-2xl border border-[#d9e0ea] bg-white shadow-[0_10px_30px_rgba(20,20,20,0.04)] sm:min-h-[260px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              {visibleTestimonials.map((t, i) => (
                <div
                  key={t._id}
                  className={cn(
                    "absolute inset-0 flex flex-col px-4 pb-12 pt-5 transition-all duration-500 ease-out sm:px-6 sm:pt-6",
                    i === active
                      ? "translate-x-0 opacity-100"
                      : i < active
                        ? "-translate-x-6 opacity-0 pointer-events-none"
                        : "translate-x-6 opacity-0 pointer-events-none",
                  )}
                  aria-hidden={i !== active}
                >
                  <Quote className="h-6 w-6 text-[#c9b4c4]" />
                  <div className="mt-3 flex gap-1 text-[#b08d9e]">
                    {Array.from({ length: t.rating || 5 }).map((_, star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#5c5660]">
                    “{t.reviewText}”
                  </p>
                  <p className="mt-4 text-[13px] font-semibold text-[#2f2c31]">
                    {t.customerName}
                    {t.reviewDate ? (
                      <span className="font-normal text-[#6B5B5B]">
                        {" "}
                        on {t.reviewDate}
                      </span>
                    ) : t.productName ? (
                      <span className="font-normal text-[#6B5B5B]">
                        {" "}
                        · {t.productName}
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}

              {visibleTestimonials.length > 1 ? (
                <div className="absolute bottom-5 left-6 z-10 flex gap-2">
                  {visibleTestimonials.map((t, i) => (
                    <button
                      key={t._id}
                      type="button"
                      aria-label={`Show review ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={cn(
                        "h-2 w-2 rounded-full transition",
                        i === active ? "bg-[#b08d9e]" : "bg-[#d5c6d1]",
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="min-w-0">
          <h2 className="font-serif text-[1.85rem] text-[#2f2c31] sm:text-3xl lg:text-[2rem]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-[14px] text-[#6B5B5B]">
            Quick answers about orders, personalization, and care.
          </p>

          <div className="mt-6 space-y-2">
            {visibleFaqs.length === 0 ? (
              <div className="rounded-2xl border border-[#d9e0ea] bg-white/70 p-6 text-sm text-[#6B5B5B]">
                FAQs will appear here once published.
              </div>
            ) : (
              visibleFaqs.map((faq) => {
                const open = openId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="overflow-hidden rounded-xl border border-[#d9e0ea] bg-white"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                      onClick={() => setOpenId(open ? null : faq._id)}
                      aria-expanded={open}
                    >
                      <span className="text-[14px] font-medium text-[#2f2c31]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-[#8a7585] transition",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open ? (
                      <div className="border-t border-[#eef1f5] px-4 py-3 text-[13px] leading-relaxed text-[#5c5660]">
                        {faq.answer}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/faq"
            className="mt-5 inline-block text-[13px] font-semibold text-[#9a7f92] underline-offset-4 hover:underline"
          >
            View all FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
