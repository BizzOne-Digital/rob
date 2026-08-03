import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { isValidPrice } from "@/lib/utils";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";

const CART_COOKIE = "rw_cart_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const personalizationSchema = z.object({
  fieldId: z.string(),
  label: z.string(),
  value: z.string(),
  fileUrl: z.string().optional(),
});

const addSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  personalization: z.array(personalizationSchema).optional(),
});

const patchSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  personalization: z.array(personalizationSchema).optional(),
});

function getOrCreateSessionId(request: NextRequest): {
  sessionId: string;
  isNew: boolean;
} {
  const existing = request.cookies.get(CART_COOKIE)?.value;
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: nanoid(24), isNew: true };
}

function withCartCookie(response: NextResponse, sessionId: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return response;
}

async function getCart(sessionId: string) {
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart;
}

function resolveUnitPrice(
  product: {
    price?: number | null;
    priceVisibility?: string | null;
    variants?: Array<{
      _id?: { toString(): string };
      id?: string;
      price?: number | null;
      available?: boolean | null;
    }>;
  },
  variantId?: string,
): number | null {
  if (product.priceVisibility === "contact") return null;

  if (variantId && product.variants?.length) {
    const variant = product.variants.find(
      (v) => String(v._id ?? v.id) === variantId,
    );
    if (!variant || variant.available === false) return null;
    if (!isValidPrice(variant.price)) return null;
    return variant.price as number;
  }

  if (!isValidPrice(product.price)) return null;
  return product.price as number;
}

export async function GET(request: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(request);
  await connectDB();
  const cart = await getCart(sessionId);
  const response = NextResponse.json({ cart });
  return withCartCookie(response, sessionId, isNew);
}

export async function POST(request: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(request);
  const json: unknown = await request.json();
  const parsed = addSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cart item", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!mongoose.Types.ObjectId.isValid(parsed.data.productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findById(parsed.data.productId);
  if (!product || product.status !== "published") {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const unitPrice = resolveUnitPrice(product, parsed.data.variantId);
  if (unitPrice === null) {
    return NextResponse.json(
      {
        error:
          "This product cannot be added to the cart because it has no set price. Please contact us.",
      },
      { status: 400 },
    );
  }

  let variantLabel: string | undefined;
  if (parsed.data.variantId) {
    const variant = product.variants.find(
      (v) => String(v._id) === parsed.data.variantId,
    );
    variantLabel = variant?.name ?? undefined;
  }

  const cart = await getCart(sessionId);
  const personalizationKey = JSON.stringify(parsed.data.personalization ?? []);
  const existing = cart.items.find(
    (item) =>
      String(item.productId) === parsed.data.productId &&
      (item.variantId ?? "") === (parsed.data.variantId ?? "") &&
      JSON.stringify(item.personalization ?? []) === personalizationKey,
  );

  if (existing) {
    existing.quantity += parsed.data.quantity;
  } else {
    cart.items.push({
      productId: product._id,
      variantId: parsed.data.variantId,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url,
      price: unitPrice,
      quantity: parsed.data.quantity,
      variantLabel,
      personalization: parsed.data.personalization,
      personalizable: product.personalizable,
    });
  }

  await cart.save();
  const response = NextResponse.json({ cart });
  return withCartCookie(response, sessionId, isNew);
}

export async function PATCH(request: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(request);
  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cart update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const cart = await getCart(sessionId);
  const item = cart.items.find((i) => String(i._id) === parsed.data.itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (parsed.data.quantity !== undefined) {
    item.quantity = parsed.data.quantity;
  }
  if (parsed.data.personalization !== undefined) {
    item.personalization = parsed.data.personalization;
  }

  await cart.save();
  const response = NextResponse.json({ cart });
  return withCartCookie(response, sessionId, isNew);
}

export async function DELETE(request: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(request);
  const itemId = request.nextUrl.searchParams.get("itemId");
  const clear = request.nextUrl.searchParams.get("clear");

  await connectDB();
  const cart = await getCart(sessionId);

  if (clear === "true") {
    cart.items.splice(0, cart.items.length);
  } else if (itemId) {
    const index = cart.items.findIndex((i) => String(i._id) === itemId);
    if (index === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    cart.items.splice(index, 1);
  } else {
    return NextResponse.json(
      { error: "itemId or clear=true required" },
      { status: 400 },
    );
  }

  await cart.save();
  const response = NextResponse.json({ cart });
  return withCartCookie(response, sessionId, isNew);
}
