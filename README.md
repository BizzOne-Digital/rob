# RW Designs Canada

Production-ready Next.js e-commerce storefront and admin portal for handmade gifts — soy candles, wax melts, freshies, beaded keychains, laser-engraved items, wood signs, and custom creations.

## Features

- Cinematic storefront with **What We Create** categories (never “Services”)
- Shop, cart, wishlist, Stripe checkout, and order status lookup
- Full admin portal: pages, products, pricing, orders, gallery, media, blogs, testimonials, FAQs, discounts, custom requests, inquiries, customers, and site settings
- MongoDB persistence, Cloudinary media (optional), Stripe payments, Resend email (optional)
- Intro animation and motion throughout, with `prefers-reduced-motion` support

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (admin) |
| Payments | Stripe |
| Media | Cloudinary (optional local uploads fallback) |
| Email | Resend |
| Motion | Framer Motion |
| Client state | Zustand |

## Prerequisites

- **Node.js 20+**
- **MongoDB** running locally, or a MongoDB Atlas connection URI
- Optional for full local parity:
  - Cloudinary account
  - Stripe test-mode keys
  - Resend API key

## MongoDB / Compass setup

1. Ensure MongoDB Server is running (on Windows, the **MongoDB** service).
2. Use this connection string:

   ```
   mongodb://127.0.0.1:27017/rw-designs-canada
   ```

3. In [MongoDB Compass](https://www.mongodb.com/products/tools/compass): **New Connection** → paste the URI → **Connect**.
4. After seeding (`npm run seed`), the database `rw-designs-canada` appears with collections.
5. Expected collections (names may vary slightly by Mongoose pluralization):

   | Collection | Purpose |
   | --- | --- |
   | `adminusers` | Admin accounts |
   | `sitesettings` | Global site config |
   | `creationcategories` | What We Create categories |
   | `pages` | CMS pages (about, policies, home sections, etc.) |
   | `products` | Catalog products |
   | `pricingitems` | Pricing catalog entries |
   | `orders` | Customer orders |
   | `carts` | Persisted carts |
   | `customers` | Customer records |
   | `customrequests` | Custom order requests |
   | `galleryitems` | Gallery |
   | `testimonials` | Testimonials |
   | `faqs` | FAQs |
   | `blogposts` / `blogcategories` | Blog |
   | `inquiries` | Contact form submissions |
   | `discounts` | Discount codes |
   | `mediaassets` | Media library metadata |
   | `newslettersubscribers` | Newsletter signups |
   | `activitylogs` | Admin activity |

## Environment

Copy the example env file and fill in values:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### Variables (from `.env.example`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Local default: `mongodb://127.0.0.1:27017/rw-designs-canada` |
| `AUTH_SECRET` | Yes | NextAuth secret. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | App URL for auth (e.g. `http://localhost:3000`) |
| `AUTH_URL` | Yes | Same base URL as above (Auth.js) |
| `ADMIN_EMAIL` | Seed only | Initial admin email created by `npm run seed` |
| `ADMIN_PASSWORD` | Seed only | Initial admin password created by seed — change in production |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | For checkout | Stripe secret key (`sk_test_…` in test mode) |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For checkout | Stripe publishable key (`pk_test_…`) |
| `RESEND_API_KEY` | No | Resend API key; without it, email is logged in dev |
| `CONTACT_RECIPIENT_EMAIL` | Recommended | Inbox for contact / inquiry notifications |
| `EMAIL_FROM` | Recommended | From address, e.g. `RW Designs Canada <onboarding@resend.dev>` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site origin (used for links, SEO, redirects) |

## Install & seed

```bash
npm install
npm run seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Admin access

- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Credentials:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local` (created by the seed script)
- Change the admin password before any production deployment

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| Dev server | `npm run dev` | Next.js development server |
| Production build | `npm run build` | Create production build |
| Start | `npm run start` | Serve the production build |
| Seed | `npm run seed` | Seed MongoDB (admin, pages, categories, sample content) |
| Typecheck | `npm run typecheck` | `tsc --noEmit` |
| Lint | `npm run lint` | ESLint |

## Stripe setup

1. Create a [Stripe](https://dashboard.stripe.com/) account and use **test mode** keys.
2. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`.
3. Webhook endpoint path: `/api/webhooks/stripe`
4. For local development, forward events with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. Copy the CLI webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Cloudinary

When `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set, uploads go to Cloudinary.

If Cloudinary is not configured, the media library falls back to local files under `/public/uploads` (served as `/uploads/...`).

## Email

Resend is optional. With `RESEND_API_KEY` set, transactional and contact emails send via Resend.

Without a key, the app logs email payloads to the console in development and skips sending.

## Deployment (Vercel)

1. Connect the repo to [Vercel](https://vercel.com/).
2. Set all required environment variables in the Vercel project settings (use production values for secrets and URLs).
3. Point `MONGODB_URI` at **MongoDB Atlas** (or another hosted cluster). Allow Vercel IPs / `0.0.0.0/0` as needed in Atlas Network Access.
4. Set `NEXTAUTH_URL`, `AUTH_URL`, and `NEXT_PUBLIC_SITE_URL` to the production domain (e.g. `https://your-domain.com`).
5. In Stripe Dashboard, add a production webhook to:

   `https://your-domain.com/api/webhooks/stripe`

   and set `STRIPE_WEBHOOK_SECRET` to the production signing secret. Use live keys when going live.
6. **Build command:** `npm run build` (Vercel default for Next.js).
7. Run `npm run seed` once against the production database (or seed from a secure machine) to create the admin user and baseline content — then change the admin password.

## Project structure

```
src/
├── app/
│   ├── (shop)/          # Storefront routes (home, shop, cart, checkout, policies, …)
│   ├── admin/           # Admin login + dashboard
│   └── api/             # Route handlers (admin, checkout, webhooks, …)
├── components/
│   ├── admin/           # Admin UI
│   ├── home/            # Homepage sections
│   ├── intro/           # Intro animation
│   ├── layout/          # Header, footer, shell
│   ├── shop/            # Catalog, cart, product UI
│   └── ui/              # Shared primitives
├── models/              # Mongoose models
├── lib/                 # db, auth, stripe, email, cloudinary, utils
├── store/               # Zustand stores
├── hooks/
└── types/
scripts/
└── seed.ts              # Database seed
public/
├── images/              # Brand + placeholders
└── uploads/             # Local media fallback
```

## Brand notes

- Never use the word **“Services”**. Use **What We Create**.
- Do not invent product prices. Products stay in **draft** until pricing is confirmed.
- About page and brand voice: use official client copy only (see seed / CMS pages).
- Handmade gifts positioning: quality, personalization, Canadian small business.

## Legal

Policy pages (privacy, shipping & returns, terms, custom order policy, etc.) are **drafts pending client and legal review**. Do not treat seeded policy text as final legal content.
