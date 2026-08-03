import type {
  ContentBlockType,
  MediaRef,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  PriceVisibility,
  ProductStatus,
  SeoFields,
} from "@/types";

export interface AdminListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AdminItemResponse<T> {
  item: T;
}

export interface ActivityLogItem {
  _id: string;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  createdAt?: string;
}

export interface DashboardCounts {
  orders: number;
  pendingOrders: number;
  inProduction: number;
  salesTotal: number;
  products: number;
  lowStock: number;
  customRequestsNew: number;
  inquiriesNew: number;
  publishedProducts: number;
  draftProducts: number;
}

export interface DashboardData {
  counts: DashboardCounts;
  recentActivity: ActivityLogItem[];
  ordersByCategory: Array<{ _id: string; count: number; revenue: number }>;
  salesTrend: Array<{ date: string; total: number; count: number }>;
}

export interface PageSection {
  key: string;
  type: ContentBlockType;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  images?: MediaRef[];
  background?: string;
  layout?: string;
  visible?: boolean;
  displayOrder?: number;
  data?: unknown;
  _id?: string;
}

export interface AdminPage {
  _id: string;
  title: string;
  slug: string;
  path: string;
  status: "draft" | "published";
  sections: PageSection[];
  seo?: SeoFields;
  showInNav?: boolean;
  navLabel?: string;
  navOrder?: number;
  updatedAt?: string;
}

export interface CreationCategoryItem {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  fullDescription?: string;
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroImage?: MediaRef | null;
  images?: MediaRef[];
  creationProcess?: Array<{ title: string; description: string }>;
  careInformation?: string;
  safetyInformation?: string;
  faqs?: Array<{ question: string; answer: string }>;
  options?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  customOrderCta?: string;
  productIds?: string[];
  displayOrder?: number;
  active?: boolean;
  seo?: SeoFields;
  updatedAt?: string;
}

export interface ProductVariantForm {
  _id?: string;
  name: string;
  sku?: string;
  options?: Record<string, string>;
  price?: number | null;
  compareAtPrice?: number | null;
  cost?: number | null;
  inventory?: number;
  trackInventory?: boolean;
  available?: boolean;
  image?: MediaRef | null;
}

export interface PersonalizationFieldForm {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "color";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  helpText?: string;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  shortDescription?: string;
  fullDescription?: string;
  price?: number | null;
  compareAtPrice?: number | null;
  cost?: number | null;
  priceVisibility?: PriceVisibility;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  sku?: string;
  inventory?: number;
  trackInventory?: boolean;
  status?: ProductStatus;
  images?: MediaRef[];
  videoUrl?: string | null;
  optionDefinitions?: Array<{ name: string; values: string[] }>;
  variants?: ProductVariantForm[];
  scent?: string;
  colour?: string;
  size?: string;
  material?: string;
  waxType?: string;
  wickType?: string;
  vessel?: string;
  burnTime?: string;
  dimensions?: string;
  personalizable?: boolean;
  personalizationFields?: PersonalizationFieldForm[];
  productionTime?: string;
  careInstructions?: string;
  safetyInformation?: string;
  shippingInformation?: string;
  featured?: boolean;
  newArrival?: boolean;
  badge?: string | null;
  giftOccasions?: string[];
  relatedProductIds?: string[];
  seo?: SeoFields;
  updatedAt?: string;
  createdAt?: string;
}

export interface PricingRow {
  _id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  regularPrice?: number | null;
  salePrice?: number | null;
  cost?: number | null;
  priceVisibility?: PriceVisibility;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
}

export interface OrderAddress {
  fullName?: string;
  email?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  _id?: string;
  productId?: string;
  variantId?: string;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  variantLabel?: string;
  personalization?: Array<{
    fieldId?: string;
    label?: string;
    value?: string;
    fileUrl?: string;
  }>;
}

export interface OrderTimelineEvent {
  _id?: string;
  status?: string;
  note?: string;
  visibleToCustomer?: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  discountCode?: string;
  shippingAmount?: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  billingAddress?: OrderAddress;
  shippingAddress?: OrderAddress;
  shippingMethod?: { id?: string; name?: string; price?: number };
  trackingNumber?: string;
  customerNotes?: string;
  internalNotes?: string;
  customerVisibleNotes?: string;
  timeline?: OrderTimelineEvent[];
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCustomer {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  orderCount?: number;
  totalSpent?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface AdminCustomRequest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  creationType: string;
  occasion?: string;
  description: string;
  preferredWording?: string;
  colours?: string;
  quantity?: number;
  budgetRange?: string;
  neededBy?: string;
  referenceImages?: Array<{ url: string; alt?: string }>;
  additionalNotes?: string;
  status: "new" | "reviewing" | "quoted" | "accepted" | "declined" | "completed";
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItemAdmin {
  _id: string;
  title: string;
  caption?: string;
  image: MediaRef;
  category?: string;
  productId?: string | null;
  productSlug?: string;
  behindTheScenes?: boolean;
  displayOrder?: number;
  published?: boolean;
  createdAt?: string;
}

export interface TestimonialAdmin {
  _id: string;
  customerName: string;
  reviewText: string;
  productId?: string | null;
  productName?: string;
  image?: MediaRef | null;
  rating?: number;
  featured?: boolean;
  approved?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export interface BlogPostAdmin {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: MediaRef | null;
  tags?: string[];
  author?: string;
  status: "draft" | "published";
  publishedAt?: string | null;
  seo?: SeoFields;
  updatedAt?: string;
  createdAt?: string;
}

export interface InquiryAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  adminNotes?: string;
  createdAt?: string;
}

export interface DiscountAdmin {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
  maxUses?: number | null;
  usedCount?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active?: boolean;
  description?: string;
  createdAt?: string;
}

export interface MediaAssetAdmin {
  _id: string;
  url: string;
  publicId?: string;
  filename?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  category?: string;
  folder?: string;
  createdAt?: string;
}

export interface SiteSettingsAdmin {
  _id?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  address?: string;
  headline?: string;
  currency?: string;
  logoLight?: MediaRef | null;
  logoDark?: MediaRef | null;
  favicon?: MediaRef | null;
  announcementBar?: {
    enabled?: boolean;
    text?: string;
    link?: string;
  };
  introWrapper?: {
    enabled?: boolean;
    durationMs?: number;
  };
  navigation?: {
    showBlog?: boolean;
    items?: Array<{
      label?: string;
      href?: string;
      visible?: boolean;
      children?: Array<{ label?: string; href?: string; visible?: boolean }>;
    }>;
  };
  footer?: {
    tagline?: string;
    copyright?: string;
  };
  tax?: {
    enabled?: boolean;
    rate?: number;
    label?: string;
    includedInPrice?: boolean;
  };
  shipping?: {
    localPickup?: {
      enabled?: boolean;
      label?: string;
      instructions?: string;
      price?: number;
    };
    flatRate?: {
      enabled?: boolean;
      label?: string;
      price?: number | null;
      note?: string;
    };
    freeShippingThreshold?: number | null;
    provinceRates?: Array<{ province?: string; price?: number }>;
    internationalEnabled?: boolean;
    defaultProductionTime?: string;
    estimatedDispatch?: string;
  };
  contactRecipientEmail?: string;
  orderEmailSender?: string;
  defaultSeo?: SeoFields & { ogImage?: string };
  analytics?: {
    googleAnalyticsId?: string;
    metaPixelId?: string;
  };
  stripeConfigured?: boolean;
  wholesaleInquiriesEnabled?: boolean;
  policies?: {
    privacy?: string;
    terms?: string;
    shippingReturns?: string;
    customOrder?: string;
    draftNotice?: string;
  };
}
