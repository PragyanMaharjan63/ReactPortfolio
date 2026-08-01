import type { MetadataRow } from "@/data/projects";

/** Technical metadata table. Only rows with a verified source are passed in. */
export function ProjectMetadata({ rows }: { rows: MetadataRow[] }) {
  return (
    <dl className="border-t border-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-line py-3"
        >
          <dt className="label pt-0.5">{row.label}</dt>
          <dd className="text-sm text-secondary">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
