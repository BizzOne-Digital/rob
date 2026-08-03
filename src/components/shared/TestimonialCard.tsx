export function TestimonialCard({
  name,
  text,
  productName,
}: {
  name: string;
  text: string;
  productName?: string | null;
}) {
  return (
    <blockquote className="flex h-full flex-col rounded-[1.5rem] border border-soft-beige/80 bg-white/75 p-6 shadow-[var(--shadow-soft)]">
      <p className="font-script text-3xl text-muted-mauve">“</p>
      <p className="mt-2 flex-1 text-base leading-relaxed text-charcoal/75">{text}</p>
      <footer className="mt-6 border-t border-soft-beige/80 pt-4">
        <cite className="not-italic font-serif text-lg text-charcoal">{name}</cite>
        {productName ? (
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-charcoal/45">
            {productName}
          </p>
        ) : null}
      </footer>
    </blockquote>
  );
}
