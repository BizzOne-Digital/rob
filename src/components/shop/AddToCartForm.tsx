"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { getDisplayPrice } from "@/lib/product-price";
import Link from "next/link";
import { resolveOptionImageUrl } from "@/lib/option-images";

interface PersonalizationField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "color";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  helpText?: string;
}

interface Variant {
  _id?: string;
  name: string;
  price?: number | null;
  available?: boolean | null;
}

function isEngravingField(field: PersonalizationField) {
  return (
    field.id === "engraving" ||
    field.id === "personalization_text" ||
    field.id === "add_personalization"
  );
}

function isPersonalizedVariant(variant: Variant | undefined) {
  if (!variant) return false;
  const name = variant.name.toLowerCase();
  return name.includes("yes please") || name.startsWith("yes");
}

export function AddToCartForm({
  product,
  onOptionImageChange,
}: {
  product: {
    _id: string;
    name: string;
    slug: string;
    price?: number | null;
    priceVisibility?: string | null;
    personalizable?: boolean;
    personalizationFields?: PersonalizationField[];
    optionDefinitions?: Array<{ name?: string | null; values?: string[] | null }>;
    variants?: Variant[];
  };
  onOptionImageChange?: (url: string | null) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string>("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const price = getDisplayPrice(product);

  const hasVariants = (product.variants?.length ?? 0) > 0;

  const selectedVariant = useMemo(
    () => product.variants?.find((v) => String(v._id) === variantId),
    [product.variants, variantId],
  );

  const personalizedSelected = isPersonalizedVariant(selectedVariant);

  const visibleFields = useMemo(() => {
    return (product.personalizationFields ?? []).filter((field) => {
      if (!isEngravingField(field)) return true;
      // Engraving / add-personalization text only when "Yes please" variant is chosen
      if (!hasVariants) return true;
      return personalizedSelected;
    });
  }, [product.personalizationFields, hasVariants, personalizedSelected]);

  const displayPriceLabel = useMemo(() => {
    if (selectedVariant && selectedVariant.price != null) {
      return getDisplayPrice({
        price: selectedVariant.price,
        priceVisibility: "show",
      }).label;
    }
    if (hasVariants && product.price != null) {
      return `${getDisplayPrice({ price: product.price, priceVisibility: "show" }).label}+`;
    }
    return price.label;
  }, [selectedVariant, hasVariants, product.price, price.label]);

  const updateField = (fieldId: string, value: string) => {
    setFields((prev) => ({ ...prev, [fieldId]: value }));

    if (!onOptionImageChange) return;

    const field = product.personalizationFields?.find((f) => f.id === fieldId);
    if (field?.type === "select") {
      const url = resolveOptionImageUrl(
        product.slug,
        fieldId,
        value,
        field.options ?? [],
      );
      onOptionImageChange(url);
    }
  };

  const onAdd = async () => {
    if (!price.hasPrice) {
      toast.message("This piece is priced on request — please contact us.");
      return;
    }

    if (hasVariants && !variantId) {
      toast.error("Please select a personalization option");
      return;
    }

    for (const field of visibleFields) {
      const needsValue =
        field.required || (isEngravingField(field) && personalizedSelected);
      if (needsValue && !fields[field.id]?.trim()) {
        toast.error(`Please complete: ${field.label}`);
        return;
      }
    }

    setLoading(true);
    const personalization = visibleFields
      .filter((f) => fields[f.id]?.trim())
      .map((f) => ({
        fieldId: f.id,
        label: f.label,
        value: fields[f.id],
      }));

    // Also record which personalization price option was chosen
    if (selectedVariant) {
      personalization.unshift({
        fieldId: "personalization_option",
        label: "Personalization",
        value: selectedVariant.name,
      });
    }

    const result = await addItem({
      productId: String(product._id),
      variantId: variantId || undefined,
      quantity,
      personalization: personalization.length ? personalization : undefined,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not add to cart");
    } else {
      toast.success("Added to your cart");
    }
  };

  if (!price.hasPrice) {
    return (
      <div className="space-y-4 rounded-2xl border border-soft-beige bg-white/70 p-5">
        <p className="font-serif text-2xl text-charcoal">Contact for Price</p>
        <p className="text-sm text-charcoal/60">
          This creation is available by request. Reach out and we’ll help with details and a quote.
        </p>
        <Button href={`/contact?product=${product.slug}`}>Contact about this piece</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-soft-beige bg-white/70 p-4 sm:p-5">
      <div>
        <p className="font-serif text-2xl text-charcoal sm:text-3xl">{displayPriceLabel}</p>
        {hasVariants && !variantId ? (
          <p className="mt-1 text-xs text-charcoal/45">
            Select personalization to see the exact price
          </p>
        ) : null}
      </div>

      {(product.personalizationFields ?? [])
        .filter((f) => !isEngravingField(f))
        .map((field) => (
          <FieldControl
            key={field.id}
            field={field}
            value={fields[field.id] ?? ""}
            onChange={(value) => updateField(field.id, value)}
          />
        ))}

      {hasVariants ? (
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/50">
            Personalization *
          </label>
          <select
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              const next = product.variants?.find(
                (v) => String(v._id) === e.target.value,
              );
              if (!isPersonalizedVariant(next)) {
                setFields((prev) => {
                  const copy = { ...prev };
                  delete copy.engraving;
                  delete copy.personalization_text;
                  delete copy.add_personalization;
                  return copy;
                });
              }
            }}
            className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none sm:h-11 sm:text-sm"
          >
            <option value="">Select…</option>
            {product.variants!.map((v) => {
              const variantPrice =
                v.price != null
                  ? getDisplayPrice({
                      price: v.price,
                      priceVisibility: "show",
                    }).label
                  : null;
              return (
                <option
                  key={String(v._id)}
                  value={String(v._id)}
                  disabled={v.available === false}
                >
                  {variantPrice ? `${v.name} (${variantPrice})` : v.name}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}

      {visibleFields.filter(isEngravingField).map((field) => (
        <div key={field.id} className="rounded-2xl border border-dashed border-dusty-lavender/60 bg-icy-blue/30 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-mauve">
            Add personalisation
          </p>
          <FieldControl
            field={{ ...field, required: personalizedSelected || field.required }}
            value={fields[field.id] ?? ""}
            onChange={(value) => updateField(field.id, value)}
            showCounter
          />
        </div>
      ))}

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/50">
          Quantity
        </label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="h-11 w-28 rounded-full border border-soft-beige bg-warm-ivory px-4 text-sm outline-none"
        />
      </div>

      <Button type="button" onClick={() => void onAdd()} disabled={loading} className="w-full">
        {loading ? "Adding…" : "Add to cart"}
      </Button>
      <p className="text-center text-xs text-charcoal/45">
        Prefer a custom quote?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-muted-mauve">
          Contact us
        </Link>
      </p>
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  showCounter = false,
}: {
  field: PersonalizationField;
  value: string;
  onChange: (value: string) => void;
  showCounter?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/50">
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "textarea" ? (
        <>
          <textarea
            value={value}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-24 w-full rounded-2xl border border-soft-beige bg-warm-ivory px-4 py-3 text-sm outline-none"
          />
          {showCounter && field.maxLength ? (
            <p className="mt-1 text-right text-xs text-charcoal/40">
              {value.length}/{field.maxLength}
            </p>
          ) : null}
        </>
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none sm:h-11 sm:text-sm"
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "color" ? "color" : "text"}
          value={value || (field.type === "color" ? "#B6A4B5" : "")}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none sm:h-11 sm:text-sm"
        />
      )}
      {field.helpText ? (
        <p className="mt-1 text-xs text-charcoal/45">{field.helpText}</p>
      ) : null}
    </div>
  );
}
