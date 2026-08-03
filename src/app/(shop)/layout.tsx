import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { IntroWrapper } from "@/components/intro/IntroWrapper";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { getSettings, serialize } from "@/lib/data";
import { BRAND } from "@/lib/constants";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsDoc = await getSettings();
  const settings = serialize(settingsDoc);
  const showBlog = Boolean(settings.navigation?.showBlog);

  return (
    <>
      <OrganizationJsonLd />
      <IntroWrapper
        enabled={settings.introWrapper?.enabled}
        durationMs={settings.introWrapper?.durationMs}
      />
      <AnnouncementBar
        enabled={settings.announcementBar?.enabled !== false}
        text="Thoughtfully handmade in Canada • Custom creations available ✨"
        link={settings.announcementBar?.link}
      />
      <Header showBlog={showBlog} />
      <main className="flex-1">{children}</main>
      <Footer
        tagline={settings.footer?.tagline}
        copyright={settings.footer?.copyright}
        email={settings.email || BRAND.email}
        phone={settings.phone || BRAND.phone}
        phoneHref={BRAND.phoneHref}
        instagramUrl={settings.instagramUrl || BRAND.instagramUrl}
        facebookUrl={settings.facebookUrl || BRAND.facebookUrl}
        showBlog={showBlog}
      />
      <CartDrawer />
    </>
  );
}
