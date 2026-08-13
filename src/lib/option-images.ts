/**
 * Maps product option selections to images in /public/images/products/.
 */
import { slugify } from "@/lib/utils";

export type OptionImageConfig = {
  fieldId: string;
  imageBaseName: string;
  extension?: string;
};

function productsImageUrl(filename: string): string {
  return `/images/products/${encodeURIComponent(filename)}`;
}

export const SOY_WAX_CUBE_DEFAULT_IMAGES = [
  {
    url: productsImageUrl("Soy-Wax-Melts-strawberry-swirl (2).png"),
    alt: "1 oz soy wax melt — Strawberry Swirl",
  },
  {
    url: productsImageUrl("Soy-Wax-Melts-fresh-pear (2).png"),
    alt: "1 oz soy wax melt — Fresh Pear",
  },
] as const;

export const PRODUCT_OPTION_IMAGES: Record<string, OptionImageConfig> = {
  "engraved-birth-month-flower-keychain": {
    fieldId: "month_flower",
    imageBaseName: "Engraved-Birth-Month-Flower-Keychain",
  },
  "soy-wax-melts-1-oz-cube": {
    fieldId: "scent",
    imageBaseName: "Soy-Wax-Melts",
  },
  "soy-wax-melts-strong-long-lasting-fragrance": {
    fieldId: "scent",
    imageBaseName: "Soy-Wax-Melts",
  },
};

/** File month keys used in Engraved-Birth-Month-Flower-Keychain-{month}-{1|2}.png */
const MONTH_FILE_KEYS: Record<string, string> = {
  january: "jan",
  jan: "jan",
  february: "feb",
  feb: "feb",
  march: "march",
  mar: "march",
  april: "april",
  may: "may",
  june: "june",
  july: "july",
  august: "aug",
  aug: "aug",
  september: "sept",
  sept: "sept",
  october: "oct",
  oct: "oct",
  november: "nov",
  nov: "nov",
  december: "dec",
  dec: "dec",
};

function monthKeyFromOption(optionValue: string): string | null {
  const monthPart = optionValue.split(" - ")[0]?.trim().toLowerCase() ?? "";
  return MONTH_FILE_KEYS[monthPart] ?? null;
}

function birthMonthFlowerImageUrl(
  optionValue: string,
  options: string[],
): string | null {
  const index = options.indexOf(optionValue);
  if (index < 0) return null;

  const monthKey = monthKeyFromOption(optionValue);
  if (!monthKey) return null;

  let flowerNum = 0;
  for (let i = 0; i <= index; i++) {
    if (monthKeyFromOption(options[i] ?? "") === monthKey) flowerNum++;
  }

  return `/images/products/Engraved-Birth-Month-Flower-Keychain-${monthKey}-${flowerNum}.png`;
}

function soyWaxMeltImageUrl(scent: string): string {
  return productsImageUrl(`Soy-Wax-Melts-${slugify(scent)}.png`);
}

/** 1 oz cube uses dedicated product photos (some with "(2)" suffix). */
const SOY_WAX_CUBE_SCENT_IMAGES: Record<string, string> = {
  Fierce: "Soy-Wax-Melts-fierce.png",
  "Fresh Pear": "Soy-Wax-Melts-fresh-pear (2).png",
  "Strawberry Swirl": "Soy-Wax-Melts-strawberry-swirl (2).png",
  "Black Cherry": "Soy-Wax-Melts-black-cherry.png",
};

function soyWaxCubeImageUrl(scent: string): string | null {
  const filename = SOY_WAX_CUBE_SCENT_IMAGES[scent];
  return filename ? productsImageUrl(filename) : null;
}

export function soyWaxMeltImageForScent(scent: string): string {
  return soyWaxMeltImageUrl(scent);
}

export function getOptionImageConfig(slug: string): OptionImageConfig | null {
  return PRODUCT_OPTION_IMAGES[slug] ?? null;
}

export function resolveOptionImageUrl(
  slug: string,
  fieldId: string,
  optionValue: string,
  options: string[],
): string | null {
  const config = getOptionImageConfig(slug);
  if (!config || config.fieldId !== fieldId || !optionValue.trim()) return null;

  if (slug === "engraved-birth-month-flower-keychain") {
    return birthMonthFlowerImageUrl(optionValue, options);
  }

  if (slug === "soy-wax-melts-1-oz-cube") {
    return soyWaxCubeImageUrl(optionValue);
  }

  if (slug === "soy-wax-melts-strong-long-lasting-fragrance") {
    return soyWaxMeltImageUrl(optionValue);
  }

  const index = options.indexOf(optionValue);
  if (index < 0) return null;

  const ext = config.extension ?? "png";
  return `/images/products/${config.imageBaseName}-${index + 1}.${ext}`;
}

export const ENGRAVED_BIRTH_MONTH_DEFAULT_IMAGES = [
  {
    url: "/images/products/Engraved-Birth-Month-Flower-Keychain-july-1.png",
    alt: "Engraved birth month flower keychain — July Larkspur",
  },
  {
    url: "/images/products/Engraved-Birth-Month-Flower-Keychain-july-2.png",
    alt: "Engraved birth month flower keychain — July Water Lily",
  },
] as const;
