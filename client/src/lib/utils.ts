/** Join class names, dropping falsy values. */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

/** Two-digit index label, e.g. 1 -> "01". */
export const pad = (n: number): string => String(n).padStart(2, "0");
