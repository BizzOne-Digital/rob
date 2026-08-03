"use client";

import { useMemo, useState } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ_CATEGORIES } from "@/lib/constants";

export function FaqBrowser({
  faqs,
}: {
  faqs: Array<{
    _id: string;
    category: string;
    question: string;
    answer: string;
  }>;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = category === "All" || faq.category === category;
      const hay = `${faq.question} ${faq.answer}`.toLowerCase();
      const matchesQ = !q.trim() || hay.includes(q.toLowerCase());
      return matchesCategory && matchesQ;
    });
  }, [faqs, q, category]);

  const categories = [
    "All",
    ...Array.from(
      new Set([
        ...FAQ_CATEGORIES,
        ...faqs.map((f) => f.category),
      ]),
    ),
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions…"
          className="h-12 flex-1 rounded-full border border-soft-beige bg-white px-5 text-sm outline-none focus:border-muted-mauve"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 rounded-full border border-soft-beige bg-white px-5 text-sm outline-none md:w-64"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-charcoal/55">
          No matching questions. Try another search.
        </p>
      ) : (
        <Accordion
          items={filtered.map((faq) => ({
            id: String(faq._id),
            question: faq.question,
            answer: faq.answer,
          }))}
        />
      )}
    </div>
  );
}
