import type { Metadata } from "next";
import Link from "next/link";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getPublishedPosts, getSettings, serialize } from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageGrid } from "@/components/shared/ImageGrid";

export const metadata: Metadata = {
  title: "Journal",
  description: "Studio notes, gifting ideas, and handmade stories from RW Designs Canada.",
};

export default async function BlogPage() {
  const [settings, postsDoc] = await Promise.all([
    getSettings(),
    getPublishedPosts(24),
  ]);
  const showBlog = Boolean(serialize(settings).navigation?.showBlog);
  const posts = serialize(postsDoc);

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes from the studio"
        description={
          showBlog
            ? "Stories, seasonal inspiration, and behind-the-scenes moments."
            : "Our journal is quietly preparing — published posts will appear here."
        }
        image={PLACEHOLDER_IMAGES.workspace}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journal" },
        ]}
      />
      <Container className="py-14">
        {!showBlog && posts.length === 0 ? (
          <EmptyState
            title="Journal coming soon"
            description="We’re crafting thoughtful posts. In the meantime, explore What We Create."
            actionLabel="What We Create"
            actionHref="/what-we-create"
          />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Check back soon for studio notes and gifting ideas."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={String(post._id)}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-[1.5rem] bg-white/70 shadow-[var(--shadow-soft)]"
              >
                <div className="relative aspect-[16/10] bg-powder-blue/40">
                  <ImageWithFallback
                    src={post.featuredImage?.url}
                    alt={post.featuredImage?.alt || post.title}
                    fill
                    sizes="33vw"
                    className="transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-mauve">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Studio note"}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-charcoal group-hover:text-muted-mauve">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-charcoal/60">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
      <Container className="pb-16">
        <ImageGrid
          images={[
            { src: PLACEHOLDER_IMAGES.gallery1, alt: "Studio" },
            { src: PLACEHOLDER_IMAGES.gallery2, alt: "Detail" },
            { src: PLACEHOLDER_IMAGES.gallery3, alt: "Process" },
            { src: PLACEHOLDER_IMAGES.gallery4, alt: "Finish" },
            { src: PLACEHOLDER_IMAGES.gallery5, alt: "Gift" },
          ]}
        />
      </Container>
    </>
  );
}
