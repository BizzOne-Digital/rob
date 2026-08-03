export type ProductStatus = "draft" | "published" | "archived";
export type PriceVisibility = "show" | "contact";
export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type OrderFulfillmentStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "in_production"
  | "ready_for_pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type InquiryType =
  | "general"
  | "product"
  | "custom_order"
  | "existing_order"
  | "wholesale";

export type ContentBlockType =
  | "hero"
  | "text"
  | "image"
  | "image_grid"
  | "cta"
  | "faq"
  | "process"
  | "categories"
  | "products"
  | "gallery"
  | "testimonials"
  | "newsletter"
  | "custom_form"
  | "gift_inspiration"
  | "marquee"
  | "split"
  | "rich";

export interface MediaRef {
  url: string;
  publicId?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface SeoFields {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  visible?: boolean;
}

export interface PersonalizationField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "color";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  helpText?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface CartPersonalization {
  fieldId: string;
  label: string;
  value: string;
  fileUrl?: string;
}

export interface CartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  personalization?: CartPersonalization[];
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: string;
  enabled: boolean;
}

export interface AddressInput {
  fullName: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}
