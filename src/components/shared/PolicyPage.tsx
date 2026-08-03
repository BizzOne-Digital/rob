import { getSettings, serialize } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { RichContent } from "@/components/shared/RichContent";

export async function PolicyPage({
  title,
  field,
}: {
  title: string;
  field: "privacy" | "terms" | "shippingReturns" | "customOrder";
}) {
  const settings = serialize(await getSettings());
  const content = settings.policies?.[field];
  const draftNotice = settings.policies?.draftNotice;

  return (
    <Container className="py-14 md:py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-mauve">Policies</p>
      <h1 className="mt-2 font-serif text-4xl text-charcoal md:text-5xl">{title}</h1>
      {draftNotice ? (
        <p className="mt-4 rounded-2xl border border-dusty-lavender/50 bg-powder-blue/40 px-4 py-3 text-sm text-charcoal/70">
          {draftNotice}
        </p>
      ) : null}
      <div className="mt-10 max-w-3xl">
        {content ? (
          <RichContent
            html={content.includes("<") ? content : content.replace(/\n/g, "<br/>")}
          />
        ) : (
          <p className="text-charcoal/65">
            This policy content is being prepared and will appear here once approved.
          </p>
        )}
      </div>
    </Container>
  );
}
