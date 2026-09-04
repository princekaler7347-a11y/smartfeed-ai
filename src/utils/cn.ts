/**
 * Combines CSS class names into one string.
 * Filters out empty or false values so conditional classes are easy to write.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
