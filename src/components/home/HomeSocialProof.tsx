"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  _id: string;
  customerName: string;
  reviewText: string;
  rating?: number | null;
  productName?: string | null;
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
  const visibleFaqs = faqs.slice(0, 5);
  const visibleTestimonials = testimonials.slice(0, 4);
  const current = visibleTestimonials[active];

  return (
    <section className="bg-[#e8eef4] py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
        {/* Testimonials */}
        <div>
          <h2 className="font-serif text-3xl text-[#2f2c31] sm:text-[2rem]">
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
            <div className="mt-6 rounded-2xl border border-[#d9e0ea] bg-white p-6 shadow-[0_10px_30px_rgba(20,20,20,0.04)]">
              <Quote className="h-6 w-6 text-[#c9b4c4]" />
              <div className="mt-3 flex gap-1 text-[#b08d9e]">
                {Array.from({ length: current?.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[#5c5660]">
                “{current?.reviewText}”
              </p>
              <p className="mt-5 text-[13px] font-semibold text-[#2f2c31]">
                {current?.customerName}
                {current?.productName ? (
                  <span className="font-normal text-[#6B5B5B]">
                    {" "}
                    · {current.productName}
                  </span>
                ) : null}
              </p>
              {visibleTestimonials.length > 1 ? (
                <div className="mt-5 flex gap-2">
                  {visibleTestimonials.map((t, i) => (
                    <button
                      key={t._id}
                      type="button"
                      aria-label={`Show testimonial ${i + 1}`}
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

          <Link
            href="/testimonials"
            className="mt-5 inline-block text-[13px] font-semibold text-[#9a7f92] underline-offset-4 hover:underline"
          >
            Read more reviews
          </Link>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-serif text-3xl text-[#2f2c31] sm:text-[2rem]">
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
