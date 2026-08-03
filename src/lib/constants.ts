export const BRAND = {
  name: "RW Designs Canada",
  email: "rwdesignscanada@gmail.com",
  phone: "905-541-8699",
  phoneHref: "tel:+19055418699",
  instagram: "@rwdesignsca",
  instagramUrl: "https://www.instagram.com/rwdesignsca",
  facebookUrl:
    "https://www.facebook.com/share/1M1epyWaiZ/?mibextid=wwXIfr",
  headline: "Beautifully handmade. Thoughtfully designed.",
  tagline: "Made With Care, Chosen With Meaning",
} as const;

export const COLORS = {
  powderBlue: "#DCE8F7",
  icyBlue: "#EDF4FC",
  mutedMauve: "#B6A4B5",
  dustyLavender: "#CABDCC",
  warmIvory: "#FAF8F4",
  softBeige: "#EDE6DD",
  charcoal: "#141414",
  white: "#FFFFFF",
  silver: "#CDD2DA",
} as const;

export const CREATION_CATEGORIES = [
  {
    name: "Freshies",
    slug: "freshies",
    summary:
      "Decorative scented freshies crafted in thoughtful shapes, colours, and fragrances for everyday spaces.",
  },
  {
    name: "Wax Melts & Candles",
    slug: "wax-melts-and-candles",
    summary:
      "Hand-poured soy candles and wax melts designed to bring warmth, scent, and calm into your home.",
  },
  {
    name: "Beaded Keychains",
    slug: "beaded-keychains",
    summary:
      "Colourful beaded keychains with optional personalization — small gifts with a handmade touch.",
  },
  {
    name: "Laser-Engraved Items",
    slug: "laser-engraved-items",
    summary:
      "Precision laser-engraved keepsakes personalized with names, dates, and meaningful designs.",
  },
  {
    name: "Wood Signs",
    slug: "wood-signs",
    summary:
      "Custom wood signs with carefully chosen finishes, lettering, and wording for home and gifting.",
  },
  {
    name: "Custom Creations",
    slug: "custom-creations",
    summary:
      "Share your vision and we’ll help bring a personalized handmade piece to life.",
  },
] as const;

export const GIFT_OCCASIONS = [
  { name: "Birthdays", slug: "birthdays" },
  { name: "Housewarming", slug: "housewarming" },
  { name: "Weddings", slug: "weddings" },
  { name: "Thank You Gifts", slug: "thank-you-gifts" },
  { name: "Seasonal Gifts", slug: "seasonal-gifts" },
  { name: "Just Because", slug: "just-because" },
  { name: "Personalized Keepsakes", slug: "personalized-keepsakes" },
] as const;

export const FAQ_CATEGORIES = [
  "Products",
  "Custom Orders",
  "Personalization",
  "Candles and Wax Melts",
  "Freshies",
  "Shipping",
  "Local Pickup",
  "Payments",
  "Returns",
  "Care Instructions",
] as const;

export const ORDER_STATUSES = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In Production" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

export const MARQUEE_ITEMS = [
  "Handmade by a Canadian Small Business",
  "Thoughtful Gifts",
  "Custom Creations",
  "Hand-Poured Candles",
  "Personalized Details",
  "Made With Care",
] as const;

export const PROCESS_STEPS = [
  {
    title: "Thoughtful concept",
    description:
      "Every piece begins with intention — colour, scent, wording, and the feeling it should create.",
  },
  {
    title: "Material preparation",
    description:
      "Premium materials are selected and prepared with care for the specific creation.",
  },
  {
    title: "Handcrafting",
    description:
      "Each item is carefully made by hand, with attention to detail at every step.",
  },
  {
    title: "Personalization",
    description:
      "Names, wording, colours, and custom details are added when requested.",
  },
  {
    title: "Quality review",
    description:
      "Finished pieces are reviewed so they meet our standards before packing.",
  },
  {
    title: "Beautiful packaging",
    description:
      "Orders are thoughtfully packaged, ready to gift or enjoy at home.",
  },
] as const;

export const ABOUT_CONTENT = {
  title: "About RW Designs Canada",
  paragraphs: [
    "At RW Designs Canada, we believe the little details make everyday moments more meaningful. Every piece is thoughtfully handcrafted with a focus on quality, timeless design, and lasting beauty.",
    "From hand-poured soy candles to personalized gifts and home décor, each creation is made with care using premium materials and attention to detail.",
    "Whether you’re treating yourself or searching for the perfect gift, our goal is to create meaningful pieces you’ll enjoy for years to come.",
    "Thank you for supporting our small Canadian business. We’re honoured to be part of your home and your special moments.",
  ],
} as const;

export const PLACEHOLDER_IMAGES = {
  candle: "/images/placeholders/candle.svg",
  waxMelts: "/images/placeholders/wax-melts.svg",
  freshie: "/images/placeholders/freshie.svg",
  keychain: "/images/placeholders/keychain.svg",
  engraved: "/images/placeholders/engraved.svg",
  woodSign: "/images/placeholders/wood-sign.svg",
  gift: "/images/placeholders/gift.svg",
  workspace: "/images/placeholders/workspace.svg",
  hands: "/images/placeholders/hands.svg",
  packaging: "/images/placeholders/packaging.svg",
  home: "/images/placeholders/home.svg",
  sparkle: "/images/placeholders/sparkle.svg",
  hero: "/images/placeholders/hero-arrangement.svg",
  process: "/images/placeholders/process.svg",
  gallery1: "/images/placeholders/gallery-1.svg",
  gallery2: "/images/placeholders/gallery-2.svg",
  gallery3: "/images/placeholders/gallery-3.svg",
  gallery4: "/images/placeholders/gallery-4.svg",
  gallery5: "/images/placeholders/gallery-5.svg",
} as const;
