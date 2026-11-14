import NextImage, { type ImageProps } from "next/image";

// Admin-supplied HTTPS images load directly in the browser; local images keep
// Next's responsive optimization without enabling an unrestricted image proxy.
export function Image(props: ImageProps) {
  const external = typeof props.src === "string" && /^https:\/\//.test(props.src);
  return <NextImage {...props} unoptimized={external || props.unoptimized} />;
}
