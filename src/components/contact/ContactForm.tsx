"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/constants";

export function ContactForm({
  defaultProduct,
  defaultType,
}: {
  defaultProduct?: string;
  defaultType?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          subject: form.get("subject") || undefined,
          message: form.get("message"),
          type: form.get("type") || "general",
          orderNumber: form.get("orderNumber") || undefined,
          productSlug: form.get("productSlug") || undefined,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not send message");
      } else {
        toast.success("Message sent — thank you!");
        e.currentTarget.reset();
      }
    } catch {
      toast.error("Could not send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[1.25rem] border border-soft-beige bg-white/70 p-4 sm:rounded-[1.75rem] sm:p-6 md:p-8">
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" />
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/45">
            Topic
          </label>
          <select
            name="type"
            defaultValue={defaultType || "general"}
            className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none sm:text-sm"
          >
            <option value="general">General</option>
            <option value="product">Product question</option>
            <option value="custom_order">Custom order</option>
            <option value="existing_order">Existing order</option>
            <option value="wholesale">Wholesale</option>
          </select>
        </div>
      </div>
      <Field label="Subject" name="subject" />
      <Field
        label="Product (optional)"
        name="productSlug"
        defaultValue={defaultProduct}
        placeholder="Product slug or name"
      />
      <Field label="Order number (if applicable)" name="orderNumber" />
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/45">
          Message *
        </label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full rounded-2xl border border-soft-beige bg-warm-ivory px-4 py-3 text-sm outline-none focus:border-muted-mauve"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending…" : "Send message"}
      </Button>
      <p className="text-xs text-charcoal/45">
        Or email{" "}
        <a href={`mailto:${BRAND.email}`} className="underline underline-offset-2">
          {BRAND.email}
        </a>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/45">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none focus:border-muted-mauve sm:text-sm"
      />
    </div>
  );
}
