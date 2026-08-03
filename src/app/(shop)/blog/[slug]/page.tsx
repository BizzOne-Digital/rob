import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, serialize } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { RichContent } from "@/components/shared/RichContent";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = serialize(await getPostBySlug(slug));
  if (!post) return { title: "Post not found" };
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const postDoc = await getPostBySlug(slug);
  if (!postDoc) notFound();
  const post = serialize(postDoc);

  return (
    <Container className="py-12 md:py-16">
      <Breadcrumbs
        className="mb-8"
        items={[
          { label: "Home", href: "/" },
          { label: "Journal", href: "/blog" },
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-mauve">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-lg text-charcoal/65">{post.excerpt}</p>
        ) : null}
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-powder-blue/40">
          <ImageWithFallback
            src={post.featuredImage?.url || PLACEHOLDER_IMAGES.workspace}
            alt={post.featuredImage?.alt || post.title}
            fill
            sizes="800px"
            priority
          />
        </div>
        <div className="mt-10">
          <RichContent html={post.content} />
        </div>
        {(post.contentImages?.length ?? 0) > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {post.contentImages!.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <ImageWithFallback
                  src={img.url}
                  alt={img.alt || post.title}
                  fill
                  sizes="400px"
                />
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </Container>
  );
}
