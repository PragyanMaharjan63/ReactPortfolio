import { Image } from "@/components/ui/Image";

export function ProjectGallery({
  items,
}: {
  items: { src: string; alt: string; caption?: string }[];
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.src}>
          <figure className="m-0">
            <div className="panel relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            {item.caption && (
              <figcaption className="mt-2 text-sm text-muted">{item.caption}</figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
