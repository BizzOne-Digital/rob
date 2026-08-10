"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSignup() {
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
    <section className="bg-[#dcc9d6]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:px-10 lg:py-14">
        <div className="max-w-md">
          <h2 className="font-serif text-3xl text-[#2f2a26] sm:text-[2rem]">
            A Little Beauty in Your Inbox
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#5c5660]">
            Occasional notes on new creations, gift ideas, and handmade updates.
            No spam — unsubscribe anytime.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex w-full max-w-md overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <label htmlFor="home-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="home-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 flex-1 bg-transparent px-4 text-[14px] text-[#2f2a26] outline-none placeholder:text-[#9a939b]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 shrink-0 bg-[#a68d7b] px-5 text-[13px] font-semibold text-white transition hover:bg-[#8f7665] disabled:opacity-60"
          >
            {loading ? "…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
