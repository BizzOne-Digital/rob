/**
 * RW Designs Canada — MongoDB seed script
 * Run: npm run seed
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env.local") });

type Media = { url: string; alt: string; caption?: string };

function media(url: string, alt: string, caption?: string): Media {
  return { url, alt, caption };
}

const IMG = {
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
  logo: "/images/brand/rw-designs-canada-logo.png",
} as const;

const ABOUT_PARAGRAPHS = [
  "At RW Designs Canada, we believe the little details make everyday moments more meaningful. Every piece is thoughtfully handcrafted with a focus on quality, timeless design, and lasting beauty.",
  "From hand-poured soy candles to personalized gifts and home décor, each creation is made with care using premium materials and attention to detail.",
  "Whether you’re treating yourself or searching for the perfect gift, our goal is to create meaningful pieces you’ll enjoy for years to come.",
  "Thank you for supporting our small Canadian business. We’re honoured to be part of your home and your special moments.",
] as const;

const DRAFT_NOTICE =
  "This policy content is a draft pending client and legal review.";

const DEFAULT_PROCESS = [
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

function section(
  partial: Record<string, unknown> & {
    key: string;
    type: string;
    displayOrder: number;
  },
) {
  return {
    visible: true,
    layout: "default",
    ...partial,
  };
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local");
  }

  const { connectDB } = await import("../src/lib/db");
  const { AdminUser } = await import("../src/models/AdminUser");
  const { SiteSettings } = await import("../src/models/SiteSettings");
  const { CreationCategory } = await import("../src/models/CreationCategory");
  const { Page } = await import("../src/models/Page");
  const { Product } = await import("../src/models/Product");
  const { FAQ } = await import("../src/models/FAQ");
  const { BlogPost, BlogCategory } = await import("../src/models/Blog");
  const { GalleryItem } = await import("../src/models/GalleryItem");
  const { Testimonial } = await import("../src/models/Testimonial");
  const { PricingItem } = await import("../src/models/PricingItem");
  const { ActivityLog } = await import("../src/models/ActivityLog");

  const conn = await connectDB();
  const dbName = conn.connection.name;

  console.log(`Connected to MongoDB database: ${dbName}`);
  console.log("Clearing existing seed collections...");

  await Promise.all([
    CreationCategory.deleteMany({}),
    Page.deleteMany({}),
    Product.deleteMany({}),
    FAQ.deleteMany({}),
    BlogPost.deleteMany({}),
    BlogCategory.deleteMany({}),
    GalleryItem.deleteMany({}),
    Testimonial.deleteMany({}),
    PricingItem.deleteMany({}),
  ]);

  // -------------------------------------------------------------------------
  // 1. AdminUser
  // -------------------------------------------------------------------------
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await AdminUser.findOneAndUpdate(
    { email: adminEmail.toLowerCase().trim() },
    {
      $set: {
        name: "RW Designs Admin",
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        role: "admin",
        isActive: true,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  // -------------------------------------------------------------------------
  // 2. SiteSettings
  // -------------------------------------------------------------------------
  const navigationItems = [
    { label: "Home", href: "/", visible: true, children: [] },
    { label: "About Us", href: "/about", visible: true, children: [] },
    {
      label: "What We Create",
      href: "/what-we-create",
      visible: true,
      children: [
        {
          label: "Freshies",
          href: "/what-we-create/freshies",
          visible: true,
        },
        {
          label: "Wax Melts & Candles",
          href: "/what-we-create/wax-melts-and-candles",
          visible: true,
        },
        {
          label: "Beaded Keychains",
          href: "/what-we-create/beaded-keychains",
          visible: true,
        },
        {
          label: "Laser-Engraved Items",
          href: "/what-we-create/laser-engraved-items",
          visible: true,
        },
        {
          label: "Wood Signs",
          href: "/what-we-create/wood-signs",
          visible: true,
        },
        {
          label: "Custom Creations",
          href: "/what-we-create/custom-creations",
          visible: true,
        },
      ],
    },
    { label: "Shop", href: "/shop", visible: true, children: [] },
    { label: "Gallery", href: "/gallery", visible: true, children: [] },
    {
      label: "Testimonials",
      href: "/testimonials",
      visible: true,
      children: [],
    },
    { label: "FAQ", href: "/faq", visible: true, children: [] },
    { label: "Contact", href: "/contact", visible: true, children: [] },
  ];

  await SiteSettings.findOneAndUpdate(
    { singletonKey: "site" },
    {
      $set: {
        singletonKey: "site",
        businessName: "RW Designs Canada",
        email: "rwdesignscanada@gmail.com",
        phone: "905-541-8699",
        instagram: "@rwdesignsca",
        instagramUrl: "https://www.instagram.com/rwdesignsca",
        facebookUrl:
          "https://www.facebook.com/share/1M1epyWaiZ/?mibextid=wwXIfr",
        headline: "Beautifully handmade. Thoughtfully designed.",
        currency: "CAD",
        logoLight: media(IMG.logo, "RW Designs Canada logo"),
        logoDark: media(IMG.logo, "RW Designs Canada logo"),
        favicon: media(IMG.logo, "RW Designs Canada"),
        announcementBar: {
          enabled: true,
          text: "Handmade gifts & home fragrance — crafted with care by RW Designs Canada",
          link: "/shop",
        },
        introWrapper: {
          enabled: true,
          durationMs: 3500,
        },
        navigation: {
          showBlog: false,
          items: navigationItems,
        },
        footer: {
          tagline: "Beautifully handmade. Thoughtfully designed.",
          copyright: "RW Designs Canada. All rights reserved.",
        },
        tax: {
          enabled: true,
          rate: 0.13,
          label: "HST",
          includedInPrice: false,
        },
        shipping: {
          localPickup: {
            enabled: true,
            label: "Local Pickup",
            instructions:
              "Pickup details and timing will be confirmed after your order is ready.",
            price: 0,
          },
          flatRate: {
            enabled: true,
            label: "Canada-wide Shipping",
            price: null,
            note: "Shipping rates are configurable. Exact cost shown at checkout once set.",
          },
          freeShippingThreshold: null,
          provinceRates: [],
          internationalEnabled: false,
          defaultProductionTime:
            "Production times vary by item and will be confirmed at checkout or by email.",
          estimatedDispatch:
            "Dispatch estimates are provided once production is complete.",
        },
        contactRecipientEmail: "rwdesignscanada@gmail.com",
        defaultSeo: {
          title: "RW Designs Canada | Beautifully Handmade Gifts",
          description:
            "Discover handcrafted candles, wax melts, personalized gifts, beaded keychains, wood signs, and custom creations by RW Designs Canada.",
          ogImage: IMG.hero,
        },
        analytics: {},
        stripeConfigured: false,
        wholesaleInquiriesEnabled: false,
        policies: {
          privacy: `${DRAFT_NOTICE}\n\nRW Designs Canada (“we”, “us”) respects your privacy. This draft outlines how contact, order, and inquiry information may be collected and used to fulfill handmade orders, respond to messages, and improve our shop experience. Personal information is not sold. Payment processing, when enabled, is handled by secure third-party providers. For questions, contact rwdesignscanada@gmail.com.`,
          terms: `${DRAFT_NOTICE}\n\nBy browsing or placing an order with RW Designs Canada, you agree to these draft terms. Product availability, personalization details, and production timelines are confirmed at order time. Colours and scents may vary slightly as each piece is handmade. Custom and personalized items may have limited change or cancellation windows once production begins.`,
          shippingReturns: `${DRAFT_NOTICE}\n\nLocal pickup and Canada-wide shipping options may be available. Flat-rate shipping pricing will be shown at checkout once configured. Production and dispatch timelines vary by item. Returns for unused, non-personalized items may be considered within a limited window; personalized and custom pieces are typically final sale unless there is a quality issue. Contact us to discuss any concern.`,
          customOrder: `${DRAFT_NOTICE}\n\nCustom creations begin with a conversation. Share your ideas, preferred materials, wording, colours, and occasion. We will confirm feasibility, timeline, and pricing before production. A deposit may be required for custom work. Once approved and in production, design changes may not be possible.`,
          draftNotice: DRAFT_NOTICE,
        },
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  // -------------------------------------------------------------------------
  // 3. CreationCategory (6)
  // -------------------------------------------------------------------------
  const categoryDefs = [
    {
      name: "Freshies",
      slug: "freshies",
      summary:
        "Decorative scented freshies crafted in thoughtful shapes, colours, and fragrances for everyday spaces.",
      fullDescription:
        "Our freshies are decorative scented pieces designed to add a soft fragrance and a handmade accent to cars, closets, drawers, and small spaces. Each freshie is carefully shaped, coloured, and scented so it feels both useful and gift-ready.",
      heroEyebrow: "Home fragrance",
      heroHeading: "Freshies",
      heroSubheading:
        "Scented shapes made to brighten everyday spaces with a gentle handmade touch.",
      heroImage: media(IMG.freshie, "Handmade scented freshie"),
      images: [
        media(IMG.freshie, "Freshie product view"),
        media(IMG.gift, "Freshie as a gift"),
        media(IMG.packaging, "Freshie packaging"),
        media(IMG.hands, "Handcrafting a freshie"),
        media(IMG.gallery1, "Freshie detail"),
      ],
      careInformation:
        "Hang or place away from direct heat and prolonged sunlight. Fragrance strength softens over time. Keep out of reach of children and pets.",
      safetyInformation:
        "For decorative fragrance use only. Do not ingest. Avoid contact with fabric or surfaces that may be sensitive to oils.",
      faqs: [
        {
          question: "How long do freshies typically last?",
          answer:
            "Fragrance longevity varies with scent, placement, and environment. Many enjoy a noticeable scent for several weeks.",
        },
        {
          question: "Can freshies be personalized?",
          answer:
            "Some designs may allow colour or shape preferences. Contact us for current personalization options.",
        },
      ],
      options: ["Shape", "Colour", "Scent"],
      ctaLink: "/shop?category=freshies",
      displayOrder: 1,
    },
    {
      name: "Wax Melts & Candles",
      slug: "wax-melts-and-candles",
      summary:
        "Hand-poured soy candles and wax melts designed to bring warmth, scent, and calm into your home.",
      fullDescription:
        "Hand-poured soy candles and wax melts crafted to fill your space with inviting fragrance. From calm everyday scents to gift-ready sets, each pour is made with care using quality wax and thoughtful fragrance choices.",
      heroEyebrow: "Home fragrance",
      heroHeading: "Wax Melts & Candles",
      heroSubheading:
        "Warm light, inviting scent, and handmade calm for your home.",
      heroImage: media(IMG.candle, "Hand-poured soy candle"),
      images: [
        media(IMG.candle, "Soy candle"),
        media(IMG.waxMelts, "Wax melts"),
        media(IMG.home, "Candle in a home setting"),
        media(IMG.packaging, "Candle packaging"),
        media(IMG.gallery2, "Fragrance collection detail"),
      ],
      careInformation:
        "Trim the wick to about ¼ inch before each burn. Allow the melt pool to reach the edges on the first burn. Never leave a burning candle unattended. For wax melts, follow your warmer’s instructions.",
      safetyInformation:
        "Keep candles away from drafts, pets, children, and flammable materials. Discontinue use when a small amount of wax remains. Wax melts are for use in approved warmers only.",
      faqs: [
        {
          question: "What wax do you use?",
          answer:
            "Our candles and melts are made with soy wax selected for a clean, quality burn and melt.",
        },
        {
          question: "Are scents strong?",
          answer:
            "Fragrance presence varies by scent and room size. We aim for inviting, balanced home fragrance.",
        },
      ],
      options: ["Scent", "Size", "Vessel"],
      ctaLink: "/shop?category=wax-melts-and-candles",
      displayOrder: 2,
    },
    {
      name: "Beaded Keychains",
      slug: "beaded-keychains",
      summary:
        "Colourful beaded keychains with optional personalization — small gifts with a handmade touch.",
      fullDescription:
        "Colourful beaded keychains that make cheerful everyday accessories and thoughtful little gifts. Many designs can be personalized with names, initials, or colour preferences.",
      heroEyebrow: "Small gifts",
      heroHeading: "Beaded Keychains",
      heroSubheading:
        "Handmade colour, charm, and optional personalization for keys and bags.",
      heroImage: media(IMG.keychain, "Beaded keychain"),
      images: [
        media(IMG.keychain, "Beaded keychain"),
        media(IMG.gift, "Keychain gift styling"),
        media(IMG.hands, "Assembling beads"),
        media(IMG.sparkle, "Keychain detail"),
        media(IMG.gallery3, "Keychain collection"),
      ],
      careInformation:
        "Avoid prolonged water exposure and harsh cleaners. Wipe gently if needed. Store away from extreme heat.",
      safetyInformation:
        "Small parts may present a choking hazard. Keep away from young children and pets.",
      faqs: [
        {
          question: "Can I request a name on a keychain?",
          answer:
            "Yes — many designs support name or initial personalization. Share your details when ordering or inquire first.",
        },
      ],
      options: ["Colours", "Name / initials", "Charm style"],
      ctaLink: "/shop?category=beaded-keychains",
      displayOrder: 3,
    },
    {
      name: "Laser-Engraved Items",
      slug: "laser-engraved-items",
      summary:
        "Precision laser-engraved keepsakes personalized with names, dates, and meaningful designs.",
      fullDescription:
        "Precision laser-engraved keepsakes personalized with names, dates, monograms, and meaningful designs. Ideal for gifting, milestones, and everyday items that feel uniquely yours.",
      heroEyebrow: "Personalized keepsakes",
      heroHeading: "Laser-Engraved Items",
      heroSubheading:
        "Clean engraving and thoughtful personalization for lasting keepsakes.",
      heroImage: media(IMG.engraved, "Laser-engraved keepsake"),
      images: [
        media(IMG.engraved, "Engraved item"),
        media(IMG.workspace, "Engraving workspace"),
        media(IMG.gift, "Engraved gift"),
        media(IMG.hands, "Detail review"),
        media(IMG.gallery4, "Engraved collection"),
      ],
      careInformation:
        "Wipe with a soft dry or slightly damp cloth. Avoid abrasive cleaners. Care may vary by material — see product notes.",
      safetyInformation:
        "Follow any material-specific guidance included with your piece.",
      faqs: [
        {
          question: "What can be engraved?",
          answer:
            "Names, dates, short messages, and select designs depending on the item and available space.",
        },
      ],
      options: ["Text", "Design", "Material"],
      ctaLink: "/shop?category=laser-engraved-items",
      displayOrder: 4,
    },
    {
      name: "Wood Signs",
      slug: "wood-signs",
      summary:
        "Custom wood signs with carefully chosen finishes, lettering, and wording for home and gifting.",
      fullDescription:
        "Custom wood signs with carefully chosen finishes, lettering, and wording for home décor and meaningful gifts. Share your phrase, style preference, and we’ll help create a piece that fits your space.",
      heroEyebrow: "Home décor",
      heroHeading: "Wood Signs",
      heroSubheading:
        "Handmade wording and finishes for welcoming walls and thoughtful gifts.",
      heroImage: media(IMG.woodSign, "Handmade wood sign"),
      images: [
        media(IMG.woodSign, "Wood sign"),
        media(IMG.home, "Sign in home setting"),
        media(IMG.workspace, "Sign workshop"),
        media(IMG.hands, "Finishing a wood sign"),
        media(IMG.gallery5, "Wood sign detail"),
      ],
      careInformation:
        "Display indoors unless noted otherwise. Dust gently. Avoid prolonged humidity and direct harsh sunlight when possible.",
      safetyInformation:
        "Hang securely using appropriate hardware for your wall type. Keep out of reach if edges or hardware could pose a risk.",
      faqs: [
        {
          question: "Can I choose my own wording?",
          answer:
            "Yes. Custom wording is a core part of many wood sign orders. We’ll confirm layout and fit before production.",
        },
      ],
      options: ["Wording", "Finish", "Size"],
      ctaLink: "/shop?category=wood-signs",
      displayOrder: 5,
    },
    {
      name: "Custom Creations",
      slug: "custom-creations",
      summary:
        "Share your vision and we’ll help bring a personalized handmade piece to life.",
      fullDescription:
        "Have something specific in mind? Custom creations start with your ideas — colours, scents, wording, occasion, and style. We’ll review what’s possible and guide you through a personalized handmade piece.",
      heroEyebrow: "Made for you",
      heroHeading: "Custom Creations",
      heroSubheading:
        "Tell us your vision. We’ll help shape a thoughtful handmade piece.",
      heroImage: media(IMG.gift, "Custom handmade creation"),
      images: [
        media(IMG.gift, "Custom gift"),
        media(IMG.workspace, "Custom making process"),
        media(IMG.hands, "Handmade details"),
        media(IMG.packaging, "Gift-ready packaging"),
        media(IMG.process, "Creation process"),
      ],
      careInformation:
        "Care depends on the finished piece. We’ll share care notes with your custom order.",
      safetyInformation:
        "Safety and use guidance will match the materials and product type of your custom piece.",
      faqs: [
        {
          question: "How do I start a custom request?",
          answer:
            "Use the contact or custom order form to share your idea, timeline, and inspiration. We’ll follow up to confirm details.",
        },
      ],
      options: ["Concept", "Materials", "Personalization"],
      ctaLink: "/contact?type=custom_order",
      ctaLabel: "Start a custom request",
      customOrderCta: "Request a custom piece",
      displayOrder: 6,
    },
  ];

  const categories = await CreationCategory.insertMany(
    categoryDefs.map((c) => ({
      ...c,
      creationProcess: [...DEFAULT_PROCESS],
      active: true,
      seo: {
        title: `${c.name} | RW Designs Canada`,
        description: c.summary,
      },
    })),
  );

  const categoryBySlug = Object.fromEntries(
    categories.map((c) => [c.slug, c]),
  );

  // -------------------------------------------------------------------------
  // 4. Pages (published)
  // -------------------------------------------------------------------------
  const pages = [
    {
      title: "Home",
      slug: "home",
      path: "/",
      navLabel: "Home",
      navOrder: 0,
      showInNav: true,
      seo: {
        title: "RW Designs Canada | Beautifully Handmade Gifts",
        description:
          "Handcrafted candles, wax melts, freshies, beaded keychains, wood signs, and custom creations by RW Designs Canada.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "RW Designs Canada",
          heading: "Beautifully handmade. Thoughtfully designed.",
          subheading: "Made With Care, Chosen With Meaning",
          body: "Discover handcrafted home fragrance and personalized gifts made with care by a Canadian small business.",
          ctaLabel: "Shop collections",
          ctaLink: "/shop",
          secondaryCtaLabel: "What we create",
          secondaryCtaLink: "/what-we-create",
          images: [media(IMG.hero, "Handmade RW Designs arrangement")],
        }),
        section({
          key: "marquee",
          type: "marquee",
          displayOrder: 1,
          heading: "Handmade highlights",
          data: {
            items: [
              "Handmade by a Canadian Small Business",
              "Thoughtful Gifts",
              "Custom Creations",
              "Hand-Poured Candles",
              "Personalized Details",
              "Made With Care",
            ],
          },
        }),
        section({
          key: "categories",
          type: "categories",
          displayOrder: 2,
          eyebrow: "Collections",
          heading: "What we create",
          subheading:
            "Explore handmade fragrance, keepsakes, and custom pieces.",
          ctaLabel: "View all creations",
          ctaLink: "/what-we-create",
        }),
        section({
          key: "gift-inspiration",
          type: "gift_inspiration",
          displayOrder: 3,
          eyebrow: "Gifting",
          heading: "Chosen with meaning",
          body: "Find handmade pieces for birthdays, housewarmings, thank-yous, and everyday moments.",
          ctaLabel: "Browse the shop",
          ctaLink: "/shop",
          images: [media(IMG.gift, "Thoughtful handmade gift")],
        }),
        section({
          key: "process",
          type: "process",
          displayOrder: 4,
          eyebrow: "Our approach",
          heading: "Made with care",
          subheading: "From concept to packaging, every step is intentional.",
          images: [media(IMG.process, "Handmade creation process")],
        }),
        section({
          key: "gallery-preview",
          type: "gallery",
          displayOrder: 5,
          eyebrow: "Gallery",
          heading: "A glimpse of our work",
          ctaLabel: "View gallery",
          ctaLink: "/gallery",
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 6,
          heading: "Have something custom in mind?",
          body: "Share your idea and we’ll help bring a personalized handmade piece to life.",
          ctaLabel: "Contact us",
          ctaLink: "/contact",
          secondaryCtaLabel: "Custom creations",
          secondaryCtaLink: "/what-we-create/custom-creations",
        }),
        section({
          key: "newsletter",
          type: "newsletter",
          displayOrder: 7,
          heading: "Stay in the loop",
          body: "Occasional updates on new creations and seasonal favourites.",
        }),
      ],
    },
    {
      title: "About Us",
      slug: "about",
      path: "/about",
      navLabel: "About Us",
      navOrder: 1,
      showInNav: true,
      seo: {
        title: "About Us | RW Designs Canada",
        description:
          "Learn about RW Designs Canada — thoughtfully handcrafted gifts and home fragrance made with care.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Our story",
          heading: "About RW Designs Canada",
          subheading: "Beautifully handmade. Thoughtfully designed.",
          images: [media(IMG.workspace, "RW Designs Canada workspace")],
        }),
        section({
          key: "about-body",
          type: "rich",
          displayOrder: 1,
          heading: "Made with care",
          body: ABOUT_PARAGRAPHS.join("\n\n"),
          bullets: [...ABOUT_PARAGRAPHS],
          images: [
            media(IMG.hands, "Handcrafting with care"),
            media(IMG.home, "Handmade pieces for the home"),
          ],
        }),
        section({
          key: "split-values",
          type: "split",
          displayOrder: 2,
          eyebrow: "Our focus",
          heading: "Quality, timeless design, and lasting beauty",
          body: "Every piece is thoughtfully handcrafted with premium materials and attention to detail — whether you’re treating yourself or searching for the perfect gift.",
          images: [media(IMG.packaging, "Thoughtful packaging")],
          ctaLabel: "Explore what we create",
          ctaLink: "/what-we-create",
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 3,
          heading: "Thank you for supporting our small Canadian business",
          body: "We’re honoured to be part of your home and your special moments.",
          ctaLabel: "Shop now",
          ctaLink: "/shop",
          secondaryCtaLabel: "Get in touch",
          secondaryCtaLink: "/contact",
        }),
      ],
    },
    {
      title: "What We Create",
      slug: "what-we-create",
      path: "/what-we-create",
      navLabel: "What We Create",
      navOrder: 2,
      showInNav: true,
      seo: {
        title: "What We Create | RW Designs Canada",
        description:
          "Explore freshies, wax melts and candles, beaded keychains, laser-engraved items, wood signs, and custom creations.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Collections",
          heading: "What we create",
          subheading:
            "Handmade fragrance, personalized keepsakes, and custom pieces crafted with care.",
          images: [media(IMG.hero, "RW Designs creation arrangement")],
        }),
        section({
          key: "categories",
          type: "categories",
          displayOrder: 1,
          heading: "Our six creation families",
          body: "Browse each collection to learn more about materials, process, care, and shop options.",
        }),
        section({
          key: "process",
          type: "process",
          displayOrder: 2,
          eyebrow: "How it’s made",
          heading: "From idea to finished piece",
          images: [media(IMG.process, "Creation process")],
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 3,
          heading: "Looking for something unique?",
          body: "Custom creations start with a conversation.",
          ctaLabel: "Request a custom piece",
          ctaLink: "/contact?type=custom_order",
        }),
      ],
    },
    {
      title: "Shop",
      slug: "shop",
      path: "/shop",
      navLabel: "Shop",
      navOrder: 3,
      showInNav: true,
      seo: {
        title: "Shop | RW Designs Canada",
        description:
          "Browse handmade products from RW Designs Canada. Pricing may require contact while catalogue items are prepared.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Shop",
          heading: "Handmade pieces for home and gifting",
          subheading:
            "Explore draft catalogue items while pricing and inventory are configured.",
          ctaLabel: "Contact for pricing",
          ctaLink: "/contact",
          images: [media(IMG.gift, "Shop handmade gifts")],
        }),
        section({
          key: "products",
          type: "products",
          displayOrder: 1,
          heading: "Products",
          body: "Filter by collection, or reach out for personalization and availability.",
        }),
      ],
    },
    {
      title: "Gallery",
      slug: "gallery",
      path: "/gallery",
      navLabel: "Gallery",
      navOrder: 4,
      showInNav: true,
      seo: {
        title: "Gallery | RW Designs Canada",
        description:
          "A visual look at handmade candles, freshies, engraved keepsakes, wood signs, and more.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Gallery",
          heading: "A look at our handmade work",
          subheading:
            "Placeholder imagery for layout — replace with real photos as they’re ready.",
          images: [media(IMG.gallery1, "Gallery hero")],
        }),
        section({
          key: "gallery",
          type: "gallery",
          displayOrder: 1,
          heading: "Featured moments",
        }),
        section({
          key: "image-grid",
          type: "image_grid",
          displayOrder: 2,
          heading: "Details & process",
          images: [
            media(IMG.hands, "Hands at work"),
            media(IMG.workspace, "Workspace"),
            media(IMG.packaging, "Packaging"),
            media(IMG.process, "Process"),
          ],
        }),
      ],
    },
    {
      title: "Testimonials",
      slug: "testimonials",
      path: "/testimonials",
      navLabel: "Testimonials",
      navOrder: 5,
      showInNav: true,
      seo: {
        title: "Testimonials | RW Designs Canada",
        description:
          "Customer kind words will appear here once reviews are approved.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Kind words",
          heading: "Testimonials",
          subheading:
            "Approved customer reviews will be published here. Placeholder entries remain unapproved until verified.",
          images: [media(IMG.sparkle, "Testimonials")],
        }),
        section({
          key: "testimonials",
          type: "testimonials",
          displayOrder: 1,
          heading: "What customers share",
          body: "Only approved testimonials are shown on the storefront.",
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 2,
          heading: "Purchased from us?",
          body: "We’d love to hear about your experience.",
          ctaLabel: "Contact us",
          ctaLink: "/contact",
        }),
      ],
    },
    {
      title: "FAQ",
      slug: "faq",
      path: "/faq",
      navLabel: "FAQ",
      navOrder: 6,
      showInNav: true,
      seo: {
        title: "FAQ | RW Designs Canada",
        description:
          "Answers about products, custom orders, shipping, pickup, payments, and care.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Help",
          heading: "Frequently asked questions",
          subheading:
            "Quick answers about our handmade products, orders, and care.",
        }),
        section({
          key: "faq",
          type: "faq",
          displayOrder: 1,
          heading: "Browse by topic",
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 2,
          heading: "Still have a question?",
          ctaLabel: "Contact us",
          ctaLink: "/contact",
        }),
      ],
    },
    {
      title: "Contact",
      slug: "contact",
      path: "/contact",
      navLabel: "Contact",
      navOrder: 7,
      showInNav: true,
      seo: {
        title: "Contact | RW Designs Canada",
        description:
          "Contact RW Designs Canada for product questions, custom orders, and order support.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Get in touch",
          heading: "Contact RW Designs Canada",
          subheading:
            "Questions, custom ideas, and order support — we’d love to hear from you.",
          images: [media(IMG.packaging, "Contact RW Designs")],
        }),
        section({
          key: "contact-details",
          type: "text",
          displayOrder: 1,
          heading: "Reach us",
          body: "Email: rwdesignscanada@gmail.com\nPhone: 905-541-8699\nInstagram: @rwdesignsca",
          bullets: [
            "Email: rwdesignscanada@gmail.com",
            "Phone: 905-541-8699",
            "Instagram: @rwdesignsca",
          ],
        }),
        section({
          key: "custom-form",
          type: "custom_form",
          displayOrder: 2,
          heading: "Send a message",
          body: "Share product questions, custom order ideas, or existing order support needs.",
        }),
      ],
    },
    {
      title: "Blog",
      slug: "blog",
      path: "/blog",
      navLabel: "Blog",
      navOrder: 90,
      showInNav: false,
      seo: {
        title: "Blog | RW Designs Canada",
        description:
          "Draft articles on candle care, gifting, personalization, and styling handmade pieces.",
        noIndex: true,
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Journal",
          heading: "Blog",
          subheading:
            "Articles are drafted and hidden from main navigation until ready to publish.",
        }),
        section({
          key: "intro",
          type: "text",
          displayOrder: 1,
          heading: "Coming soon",
          body: "Care tips, gift ideas, and inspiration from RW Designs Canada.",
        }),
      ],
    },
    {
      title: "Cart",
      slug: "cart",
      path: "/cart",
      navLabel: "Cart",
      navOrder: 100,
      showInNav: false,
      seo: {
        title: "Cart | RW Designs Canada",
        description: "Review items in your RW Designs Canada cart.",
        noIndex: true,
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          heading: "Your cart",
          subheading: "Review quantities and personalization before checkout.",
        }),
        section({
          key: "cta",
          type: "cta",
          displayOrder: 1,
          heading: "Ready to continue?",
          ctaLabel: "Continue shopping",
          ctaLink: "/shop",
          secondaryCtaLabel: "Checkout",
          secondaryCtaLink: "/checkout",
        }),
      ],
    },
    {
      title: "Checkout",
      slug: "checkout",
      path: "/checkout",
      navLabel: "Checkout",
      navOrder: 101,
      showInNav: false,
      seo: {
        title: "Checkout | RW Designs Canada",
        description: "Secure checkout for RW Designs Canada orders.",
        noIndex: true,
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          heading: "Checkout",
          subheading:
            "Enter shipping or pickup details. Shipping rates appear once configured.",
        }),
        section({
          key: "note",
          type: "text",
          displayOrder: 1,
          heading: "Production & delivery",
          body: "Production times vary by item and will be confirmed at checkout or by email. Local pickup instructions are shared when your order is ready.",
        }),
      ],
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      path: "/privacy-policy",
      navLabel: "Privacy Policy",
      navOrder: 200,
      showInNav: false,
      seo: {
        title: "Privacy Policy | RW Designs Canada",
        description: "Draft privacy policy for RW Designs Canada.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Policies",
          heading: "Privacy Policy",
          subheading: DRAFT_NOTICE,
        }),
        section({
          key: "body",
          type: "rich",
          displayOrder: 1,
          body: `${DRAFT_NOTICE}\n\nRW Designs Canada respects your privacy. Information shared through orders, contact forms, and inquiries is used to fulfill handmade products, respond to messages, and operate the shop. We do not sell personal information. When online payments are enabled, card details are processed by secure third-party providers. Contact rwdesignscanada@gmail.com with privacy questions.`,
        }),
      ],
    },
    {
      title: "Terms and Conditions",
      slug: "terms-and-conditions",
      path: "/terms-and-conditions",
      navLabel: "Terms and Conditions",
      navOrder: 201,
      showInNav: false,
      seo: {
        title: "Terms and Conditions | RW Designs Canada",
        description: "Draft terms and conditions for RW Designs Canada.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Policies",
          heading: "Terms and Conditions",
          subheading: DRAFT_NOTICE,
        }),
        section({
          key: "body",
          type: "rich",
          displayOrder: 1,
          body: `${DRAFT_NOTICE}\n\nBy using this website or placing an order, you agree to these draft terms. Handmade items may have slight variations. Personalization details must be confirmed before production. Availability, timelines, and pricing are confirmed at order time. Custom and personalized pieces may have limited cancellation options once work has begun.`,
        }),
      ],
    },
    {
      title: "Shipping and Returns",
      slug: "shipping-and-returns",
      path: "/shipping-and-returns",
      navLabel: "Shipping and Returns",
      navOrder: 202,
      showInNav: false,
      seo: {
        title: "Shipping and Returns | RW Designs Canada",
        description: "Draft shipping and returns policy for RW Designs Canada.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Policies",
          heading: "Shipping and Returns",
          subheading: DRAFT_NOTICE,
        }),
        section({
          key: "body",
          type: "rich",
          displayOrder: 1,
          body: `${DRAFT_NOTICE}\n\nLocal pickup and Canada-wide shipping may be offered. Flat-rate shipping pricing is configurable and shown at checkout once set. Production and dispatch timelines vary. Non-personalized items may be eligible for return discussion within a limited window; personalized and custom orders are generally final sale except for quality concerns. Email rwdesignscanada@gmail.com for help.`,
        }),
      ],
    },
    {
      title: "Custom Order Policy",
      slug: "custom-order-policy",
      path: "/custom-order-policy",
      navLabel: "Custom Order Policy",
      navOrder: 203,
      showInNav: false,
      seo: {
        title: "Custom Order Policy | RW Designs Canada",
        description: "Draft custom order policy for RW Designs Canada.",
      },
      sections: [
        section({
          key: "hero",
          type: "hero",
          displayOrder: 0,
          eyebrow: "Policies",
          heading: "Custom Order Policy",
          subheading: DRAFT_NOTICE,
        }),
        section({
          key: "body",
          type: "rich",
          displayOrder: 1,
          body: `${DRAFT_NOTICE}\n\nCustom orders begin with your ideas and our feasibility review. We confirm design details, timeline, and pricing before production. A deposit may be required. Once approved and in production, changes may not be possible. Care and delivery notes are shared with your finished piece.`,
        }),
      ],
    },
  ];

  await Page.insertMany(
    pages.map((p) => ({
      ...p,
      status: "published" as const,
    })),
  );

  // -------------------------------------------------------------------------
  // 5. Draft products (1–2 per category)
  // -------------------------------------------------------------------------
  const productDefs: Array<{
    name: string;
    slug: string;
    categorySlug: string;
    shortDescription: string;
    fullDescription: string;
    image: string;
    personalizable?: boolean;
    scent?: string;
    material?: string;
  }> = [
    {
      name: "Signature Soy Candle (Draft)",
      slug: "signature-soy-candle-draft",
      categorySlug: "wax-melts-and-candles",
      shortDescription:
        "Hand-poured soy candle draft listing — scent and vessel options to be confirmed.",
      fullDescription:
        "A draft catalogue entry for a signature hand-poured soy candle. Pricing and final product details will be set before publishing.",
      image: IMG.candle,
      scent: "To be confirmed",
      material: "Soy wax",
    },
    {
      name: "Everyday Wax Melts (Draft)",
      slug: "everyday-wax-melts-draft",
      categorySlug: "wax-melts-and-candles",
      shortDescription:
        "Draft wax melt set for warmer use — fragrance lineup pending.",
      fullDescription:
        "Placeholder wax melts listing for catalogue structure. Contact for current scents and availability.",
      image: IMG.waxMelts,
      scent: "To be confirmed",
      material: "Soy wax",
    },
    {
      name: "Classic Scented Freshie (Draft)",
      slug: "classic-scented-freshie-draft",
      categorySlug: "freshies",
      shortDescription:
        "Decorative scented freshie draft — shapes and scents configurable.",
      fullDescription:
        "Draft freshie product for shop structure. Final shapes, colours, and fragrances will be published when ready.",
      image: IMG.freshie,
      scent: "To be confirmed",
    },
    {
      name: "Seasonal Freshie Shape (Draft)",
      slug: "seasonal-freshie-shape-draft",
      categorySlug: "freshies",
      shortDescription: "Seasonal freshie shape draft listing.",
      fullDescription:
        "A second draft freshie entry for seasonal shapes. Pricing remains contact-only until configured.",
      image: IMG.freshie,
    },
    {
      name: "Colour-Pop Beaded Keychain (Draft)",
      slug: "colour-pop-beaded-keychain-draft",
      categorySlug: "beaded-keychains",
      shortDescription:
        "Handmade beaded keychain draft with optional name personalization.",
      fullDescription:
        "Draft keychain listing. Colourways and personalization fields will be finalized before publish.",
      image: IMG.keychain,
      personalizable: true,
    },
    {
      name: "Initial Charm Keychain (Draft)",
      slug: "initial-charm-keychain-draft",
      categorySlug: "beaded-keychains",
      shortDescription: "Beaded keychain draft with initial charm option.",
      fullDescription:
        "Placeholder personalized keychain entry for catalogue and pricing admin workflows.",
      image: IMG.keychain,
      personalizable: true,
    },
    {
      name: "Personalized Engraved Keepsake (Draft)",
      slug: "personalized-engraved-keepsake-draft",
      categorySlug: "laser-engraved-items",
      shortDescription:
        "Laser-engraved keepsake draft — text and design confirmed per order.",
      fullDescription:
        "Draft engraved item for shop structure. Share wording and preferred design when inquiring.",
      image: IMG.engraved,
      personalizable: true,
      material: "Varies by piece",
    },
    {
      name: "Engraved Everyday Tag (Draft)",
      slug: "engraved-everyday-tag-draft",
      categorySlug: "laser-engraved-items",
      shortDescription: "Small engraved tag draft listing.",
      fullDescription:
        "Draft laser-engraved tag product. Final materials and price visibility set in admin before publish.",
      image: IMG.engraved,
      personalizable: true,
    },
    {
      name: "Welcome Wood Sign (Draft)",
      slug: "welcome-wood-sign-draft",
      categorySlug: "wood-signs",
      shortDescription:
        "Custom wording wood sign draft for home décor and gifting.",
      fullDescription:
        "Draft wood sign listing. Finish, size, and wording confirmed per order before production.",
      image: IMG.woodSign,
      personalizable: true,
      material: "Wood",
    },
    {
      name: "Custom Phrase Wood Sign (Draft)",
      slug: "custom-phrase-wood-sign-draft",
      categorySlug: "wood-signs",
      shortDescription: "Wood sign draft for custom phrases and finishes.",
      fullDescription:
        "Placeholder custom wood sign entry. Contact to discuss wording and styling.",
      image: IMG.woodSign,
      personalizable: true,
      material: "Wood",
    },
    {
      name: "Bespoke Custom Creation (Draft)",
      slug: "bespoke-custom-creation-draft",
      categorySlug: "custom-creations",
      shortDescription:
        "Start-here draft for fully custom handmade requests.",
      fullDescription:
        "Use this draft custom creation pathway to inquire about personalized pieces outside the standard catalogue.",
      image: IMG.gift,
      personalizable: true,
    },
  ];

  const products = await Product.insertMany(
    productDefs.map((p) => {
      const category = categoryBySlug[p.categorySlug];
      return {
        name: p.name,
        slug: p.slug,
        categoryId: category?._id,
        categorySlug: p.categorySlug,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        price: null,
        compareAtPrice: null,
        cost: null,
        priceVisibility: "contact" as const,
        status: "draft" as const,
        images: [media(p.image, p.name)],
        inventory: 0,
        trackInventory: true,
        personalizable: Boolean(p.personalizable),
        personalizationFields: p.personalizable
          ? [
              {
                id: "personalization-notes",
                label: "Personalization details",
                type: "textarea" as const,
                required: false,
                placeholder: "Names, dates, colours, wording, or other notes",
                helpText: "We’ll confirm details before production.",
              },
            ]
          : [],
        scent: p.scent,
        material: p.material,
        featured: false,
        newArrival: false,
        giftOccasions: ["Just Because", "Thank You Gifts"],
        seo: {
          title: `${p.name} | RW Designs Canada`,
          description: p.shortDescription,
          noIndex: true,
        },
      };
    }),
  );

  // Link product IDs back onto categories
  for (const category of categories) {
    const ids = products
      .filter((p) => p.categorySlug === category.slug)
      .map((p) => p._id);
    category.productIds = ids;
    await category.save();
  }

  // -------------------------------------------------------------------------
  // 6. FAQs
  // -------------------------------------------------------------------------
  const faqDefs: Array<{
    category: string;
    question: string;
    answer: string;
    featured?: boolean;
    displayOrder: number;
  }> = [
    {
      category: "Products",
      question: "Are your products handmade?",
      answer:
        "Yes. RW Designs Canada creations are thoughtfully handcrafted with attention to detail and quality materials.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Products",
      question: "Do you publish all prices online?",
      answer:
        "Some catalogue items may show contact-for-pricing while details are finalized. Reach out for current availability and quotes.",
      displayOrder: 2,
    },
    {
      category: "Custom Orders",
      question: "Can I request a custom piece?",
      answer:
        "Absolutely. Share your vision through our contact form — colours, wording, occasion, and timeline — and we’ll follow up.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Custom Orders",
      question: "How does the custom order process work?",
      answer:
        "We review your idea, confirm feasibility, outline timeline and pricing, then begin production once details are approved.",
      displayOrder: 2,
    },
    {
      category: "Personalization",
      question: "What personalization options are available?",
      answer:
        "Depending on the product, you may choose names, initials, dates, short messages, colours, or wording. Options are listed per item when available.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Personalization",
      question: "Can I change personalization after ordering?",
      answer:
        "Please double-check details at checkout. Changes may not be possible once production has started.",
      displayOrder: 2,
    },
    {
      category: "Candles and Wax Melts",
      question: "What wax do you use for candles and melts?",
      answer:
        "We use soy wax selected for quality home fragrance. Specific vessel and scent details appear on each product when published.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Candles and Wax Melts",
      question: "How should I burn my candle safely?",
      answer:
        "Trim the wick before each burn, keep within sight, and away from drafts, children, pets, and flammable items. Follow all care notes included with your order.",
      displayOrder: 2,
    },
    {
      category: "Freshies",
      question: "Where can I use a freshie?",
      answer:
        "Freshies are popular in cars, closets, and small spaces. Place away from intense heat and keep out of reach of children and pets.",
      displayOrder: 1,
    },
    {
      category: "Freshies",
      question: "How long does the scent last?",
      answer:
        "Longevity varies by fragrance, airflow, and environment. Many enjoy a noticeable scent for several weeks.",
      displayOrder: 2,
    },
    {
      category: "Shipping",
      question: "Do you ship across Canada?",
      answer:
        "Canada-wide shipping can be enabled with a configurable flat rate shown at checkout once set. Exact costs appear when shipping is configured.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Shipping",
      question: "How long does production take?",
      answer:
        "Production times vary by item and personalization. Timelines are confirmed at checkout or by email.",
      displayOrder: 2,
    },
    {
      category: "Local Pickup",
      question: "Is local pickup available?",
      answer:
        "Yes. Local pickup can be selected when enabled. Timing and details are confirmed after your order is ready.",
      featured: true,
      displayOrder: 1,
    },
    {
      category: "Local Pickup",
      question: "Will I be notified when pickup is ready?",
      answer:
        "Yes. We’ll share pickup instructions once production is complete and your order is ready.",
      displayOrder: 2,
    },
    {
      category: "Payments",
      question: "What payment methods do you accept?",
      answer:
        "When online checkout is enabled, secure card payments are processed through Stripe. We’ll confirm available methods at purchase time.",
      displayOrder: 1,
    },
    {
      category: "Payments",
      question: "When am I charged for custom orders?",
      answer:
        "Custom work may require a deposit or full payment before production. We’ll outline payment steps when confirming your request.",
      displayOrder: 2,
    },
    {
      category: "Returns",
      question: "What is your return policy?",
      answer:
        "Our shipping and returns policy is currently a draft pending review. Personalized and custom items are typically final sale unless there is a quality issue — contact us and we’ll help.",
      displayOrder: 1,
    },
    {
      category: "Returns",
      question: "What if my order arrives damaged?",
      answer:
        "Please contact us promptly with photos and your order details so we can make it right.",
      featured: true,
      displayOrder: 2,
    },
    {
      category: "Care Instructions",
      question: "How do I care for candles and wax melts?",
      answer:
        "Trim wicks, burn within sight, and follow warmer instructions for melts. See product care notes for specifics.",
      displayOrder: 1,
    },
    {
      category: "Care Instructions",
      question: "How should I care for wood signs and engraved items?",
      answer:
        "Dust gently and avoid harsh cleaners. Indoor display is recommended unless noted otherwise. Material-specific tips ship with your piece.",
      displayOrder: 2,
    },
  ];

  await FAQ.insertMany(
    faqDefs.map((f) => ({
      ...f,
      published: true,
      featured: Boolean(f.featured),
    })),
  );

  // -------------------------------------------------------------------------
  // 7. Draft blog posts
  // -------------------------------------------------------------------------
  const blogCategory = await BlogCategory.create({
    name: "Inspiration",
    slug: "inspiration",
    description: "Care tips, gifting ideas, and handmade inspiration.",
  });

  const blogDefs = [
    {
      title: "How to Care for Your Handmade Candle",
      slug: "how-to-care-for-your-handmade-candle",
      excerpt:
        "Simple habits that help your hand-poured candle burn beautifully and safely.",
      content: `<p>${DRAFT_NOTICE}</p><p>Trim the wick before each burn, allow an even first melt pool, and never leave a candle unattended. Keep away from drafts and flammable materials. More care tips will be expanded before this article is published.</p>`,
      image: IMG.candle,
      tags: ["candles", "care"],
    },
    {
      title: "Gift Ideas for Meaningful Occasions",
      slug: "gift-ideas-for-meaningful-occasions",
      excerpt:
        "Thoughtful handmade ideas for birthdays, thank-yous, housewarmings, and more.",
      content: `<p>${DRAFT_NOTICE}</p><p>Handmade fragrance, personalized keychains, engraved keepsakes, and wood signs make meaningful gifts. Match the piece to the occasion and add a personal detail when you can.</p>`,
      image: IMG.gift,
      tags: ["gifting", "ideas"],
    },
    {
      title: "The Beauty of Personalized Gifts",
      slug: "the-beauty-of-personalized-gifts",
      excerpt:
        "Why names, dates, and custom wording turn handmade pieces into lasting keepsakes.",
      content: `<p>${DRAFT_NOTICE}</p><p>Personalization adds meaning — a name on a keychain, a date on an engraved piece, or a favourite phrase on a wood sign. Share your details and we’ll help guide what’s possible.</p>`,
      image: IMG.engraved,
      tags: ["personalization", "gifting"],
    },
    {
      title: "Styling Handmade Wood Signs",
      slug: "styling-handmade-wood-signs",
      excerpt:
        "Ideas for placing custom wood signs in entryways, living spaces, and gift settings.",
      content: `<p>${DRAFT_NOTICE}</p><p>Wood signs shine in entryways, galleries, and cozy corners. Choose wording that fits your space and pair finishes with your existing décor.</p>`,
      image: IMG.woodSign,
      tags: ["wood-signs", "home"],
    },
    {
      title: "Choosing a Scent for Your Space",
      slug: "choosing-a-scent-for-your-space",
      excerpt:
        "A gentle guide to picking candles, melts, and freshies that suit your home.",
      content: `<p>${DRAFT_NOTICE}</p><p>Consider room size, time of day, and the feeling you want — calm, fresh, or cozy. Start with scents you already love, and ask us for guidance on current fragrance options.</p>`,
      image: IMG.waxMelts,
      tags: ["fragrance", "home"],
    },
  ];

  await BlogPost.insertMany(
    blogDefs.map((b) => ({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      featuredImage: media(b.image, b.title),
      categoryIds: [blogCategory._id],
      tags: b.tags,
      author: "RW Designs Canada",
      status: "draft" as const,
      seo: {
        title: `${b.title} | RW Designs Canada`,
        description: b.excerpt,
        noIndex: true,
      },
    })),
  );

  // -------------------------------------------------------------------------
  // 8. Gallery items (published, ≥8)
  // -------------------------------------------------------------------------
  const galleryDefs = [
    {
      title: "Hand-poured candle detail",
      caption: "Soy candle craftsmanship",
      image: IMG.candle,
      category: "Wax Melts & Candles",
    },
    {
      title: "Wax melt set",
      caption: "Home fragrance melts",
      image: IMG.waxMelts,
      category: "Wax Melts & Candles",
    },
    {
      title: "Scented freshie",
      caption: "Decorative fragrance for everyday spaces",
      image: IMG.freshie,
      category: "Freshies",
    },
    {
      title: "Beaded keychain colourway",
      caption: "Small handmade gift",
      image: IMG.keychain,
      category: "Beaded Keychains",
    },
    {
      title: "Laser-engraved keepsake",
      caption: "Personalized engraving",
      image: IMG.engraved,
      category: "Laser-Engraved Items",
    },
    {
      title: "Custom wood sign",
      caption: "Wording for home and gifting",
      image: IMG.woodSign,
      category: "Wood Signs",
    },
    {
      title: "Gift-ready packaging",
      caption: "Thoughtfully packed orders",
      image: IMG.packaging,
      category: "Behind the Scenes",
      behindTheScenes: true,
    },
    {
      title: "Workspace moments",
      caption: "Making with care",
      image: IMG.workspace,
      category: "Behind the Scenes",
      behindTheScenes: true,
    },
    {
      title: "Gallery arrangement one",
      caption: "Handmade collection preview",
      image: IMG.gallery1,
      category: "Gallery",
    },
    {
      title: "Gallery arrangement two",
      caption: "Texture and detail",
      image: IMG.gallery2,
      category: "Gallery",
    },
  ];

  await GalleryItem.insertMany(
    galleryDefs.map((g, index) => ({
      title: g.title,
      caption: g.caption,
      image: media(g.image, g.title, g.caption),
      category: g.category,
      behindTheScenes: Boolean(g.behindTheScenes),
      displayOrder: index + 1,
      published: true,
    })),
  );

  // -------------------------------------------------------------------------
  // 9. Testimonials (UNAPPROVED placeholders only)
  // -------------------------------------------------------------------------
  await Testimonial.insertMany([
    {
      customerName: "Placeholder Customer A",
      reviewText:
        "Placeholder review — do not publish. Replace with a real approved customer testimonial.",
      productName: "Draft catalogue item",
      rating: 5,
      featured: false,
      approved: false,
      displayOrder: 1,
    },
    {
      customerName: "Placeholder Customer B",
      reviewText:
        "Placeholder review — awaiting real customer permission before approval.",
      productName: "Custom creation",
      rating: 5,
      featured: false,
      approved: false,
      displayOrder: 2,
    },
    {
      customerName: "Placeholder Customer C",
      reviewText:
        "Placeholder review — unapproved sample for admin workflow testing only.",
      rating: 5,
      featured: false,
      approved: false,
      displayOrder: 3,
    },
  ]);

  // -------------------------------------------------------------------------
  // 10. PricingItem rows synced from draft products
  // -------------------------------------------------------------------------
  await PricingItem.insertMany(
    products.map((p) => ({
      productId: p._id,
      variantId: null,
      productName: p.name,
      variantName: undefined,
      sku: p.sku,
      regularPrice: null,
      salePrice: null,
      cost: null,
      priceVisibility: "contact" as const,
    })),
  );

  // -------------------------------------------------------------------------
  // ActivityLog
  // -------------------------------------------------------------------------
  await ActivityLog.create({
    actorEmail: admin.email,
    actorId: admin._id,
    action: "seed.run",
    entityType: "Database",
    entityId: dbName,
    summary: "Initial RW Designs Canada database seed completed",
    meta: {
      categories: categories.length,
      pages: pages.length,
      products: products.length,
      faqs: faqDefs.length,
      blogPosts: blogDefs.length,
      galleryItems: galleryDefs.length,
    },
  });

  const counts = {
    adminUsers: await AdminUser.countDocuments(),
    siteSettings: await SiteSettings.countDocuments(),
    creationCategories: await CreationCategory.countDocuments(),
    pages: await Page.countDocuments(),
    products: await Product.countDocuments(),
    faqs: await FAQ.countDocuments(),
    blogPosts: await BlogPost.countDocuments(),
    blogCategories: await BlogCategory.countDocuments(),
    galleryItems: await GalleryItem.countDocuments(),
    testimonials: await Testimonial.countDocuments({ approved: false }),
    pricingItems: await PricingItem.countDocuments(),
    activityLogs: await ActivityLog.countDocuments({ action: "seed.run" }),
  };

  console.log("\nSeed completed successfully");
  console.log(`   Database: ${dbName}`);
  console.log("   Counts:");
  for (const [key, value] of Object.entries(counts)) {
    console.log(`   - ${key}: ${value}`);
  }

  await conn.disconnect();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
