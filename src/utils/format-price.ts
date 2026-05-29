/**
 * Format a price amount returned by the public storefront API into a string
 * with thousand separators (e.g. "20000.00" → "20,000.00").
 *
 * The API returns prices as raw decimal amounts in the org's currency, NOT
 * as integer cents. Earlier the catalog components divided by 100 here, which
 * silently stripped two zeros — "Flashcard de animales" priced at 20,000 COP
 * rendered as "$200.00".
 *
 * Callers add the currency symbol / fallback string (the cart uses
 * `useFormatCurrency` with the org's currency code; the catalog/home cards
 * still prefix with "$").
 */
export function formatPrice(
  price: number | string | null | undefined,
): string {
  if (price == null || price === '') return '';
  const n = typeof price === 'number' ? price : Number(price);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}