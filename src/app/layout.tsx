import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";
import { BRAND } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${BRAND.name} | Beautifully Handmade Gifts`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Discover handcrafted candles, wax melts, personalized gifts, beaded keychains, wood signs, and custom creations by RW Designs Canada.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.headline,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.png" }],
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8e0d6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-CA"
      className={`${cormorant.variable} ${outfit.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="flex min-h-full w-full max-w-full flex-col overflow-x-clip font-sans text-charcoal">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "!bg-white !text-charcoal !border-soft-beige !shadow-lg !rounded-xl",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
