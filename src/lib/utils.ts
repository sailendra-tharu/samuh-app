type ClassValue = string | false | null | undefined;

/** Combine conditional Tailwind class names. */
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}
