import { Image } from "@/components/ui/Image";

/** Asymmetric mosaic: wide / narrow pairs, so a gallery reads as a contact sheet rather than a grid of equals. */
export function ProjectGallery({
  items,
}: {
  items: { src: string; alt: string; caption?: string }[];
}) {
  return (
    <ul className="mosaic">
      {items.map((item, i) => {
        const narrow = i % 4 === 1 || i % 4 === 2;
        return (
          <li key={item.src}>
            <figure className="m-0">
              <div className={`panel relative w-full overflow-hidden ${narrow ? "aspect-[2/3] max-sm:aspect-[4/3]" : "aspect-[4/3]"}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={narrow ? "(max-width: 640px) 50vw, 24vw" : "(max-width: 640px) 50vw, 48vw"}
                  className="object-cover"
                />
              </div>
              <figcaption className="label mt-2">
                {String(i + 1).padStart(2, "0")}{item.caption ? ` — ${item.caption}` : ` — ${item.alt}`}
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
