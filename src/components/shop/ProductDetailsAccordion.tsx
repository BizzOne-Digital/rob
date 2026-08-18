"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export function ProductDetailsAccordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  return (
    <div className={cn("bg-[#0a0a0a] text-[#f3efe8]", className)}>
      <div className="mx-auto max-w-[920px] px-4 py-2 sm:px-8">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              className="border-b border-white/15 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
              >
                <span className="font-serif text-xl leading-snug tracking-[-0.01em] text-[#f3efe8] sm:text-[1.6rem]">
                  {item.title}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[#c4a35a] transition-transform duration-300",
                    open && "rotate-180",
                  )}
                  strokeWidth={1.75}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="pb-6 font-sans text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
