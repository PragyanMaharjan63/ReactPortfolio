import type { MetadataRow } from "@/data/projects";

/** Technical metadata as a datasheet. Only rows with a verified source are passed in. */
export function ProjectMetadata({ rows }: { rows: MetadataRow[] }) {
  return (
    <dl className="spec">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="label">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
