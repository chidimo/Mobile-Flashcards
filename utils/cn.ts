type ClassValue =
  | string
  | false
  | null
  | undefined
  | Record<string, boolean | null | undefined>;

/**
 * Joins class names, skipping falsy values, so conditions stay out of template strings:
 *
 *   cn("flex-1 rounded-xl", selected ? "bg-white" : "bg-transparent", disabled && "opacity-60")
 *   cn("text-base", { "font-bold": active, "text-red-600": failed })
 *
 * Doesn't resolve conflicts (no tailwind-merge): pass one side of a conflict, not both.
 */
export const cn = (...values: ClassValue[]): string =>
  values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      return Object.entries(value).flatMap(([name, on]) => (on ? [name] : []));
    })
    .join(" ");
