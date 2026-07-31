export default function SectionHeading({ id, title, meta }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-border pb-6">
      <h2 id={id} className="text-h2 font-semibold text-fg">
        {title}
      </h2>
      {meta && <p className="label">{meta}</p>}
    </div>
  );
}
