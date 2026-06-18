type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}
