/**
 * The class list of a data section, with its layout variant (#2308).
 *
 * WHY. Every generated site used to render services, reviews and FAQs with
 * the same card grid, so sites read as one template. The generator now picks
 * a layout per section (`data-variant` on its placeholder). Only a variant
 * this island knows becomes a class, so a typo renders the default layout
 * instead of an unstyled one.
 */
export function sectionClass(
  base: string,
  variant: string | undefined,
  allowed: readonly string[],
): string {
  const known = variant && allowed.includes(variant) ? variant : allowed[0];
  return `sc-section ${base} sc-section--v-${known}`;
}
