/**
 * Shared formatting utilities.
 *
 * Centralises number/currency formatting so every page renders values consistently.
 */

/**
 * Format a numeric value as a locale-aware currency string.
 *
 * Uses `Intl.NumberFormat` so thousand separators and currency symbols adapt to
 * the user's browser locale. Pass the ISO 4217 currency code from org settings.
 *
 * @example
 * ```ts
 * formatCurrency('1500', 'USD')   // '$1,500.00'  (en-US browser)
 * formatCurrency(120000, 'COP')   // 'COP 120.000,00' or '$120,000.00'
 * formatCurrency(null)            // '$0.00'
 * formatCurrency('invalid')       // '$0.00'
 * ```
 */
export function formatCurrency(
  value: string | number | null | undefined,
  currency: string = 'USD',
): string {
  const cur = currency.toUpperCase();

  const num =
    typeof value === 'number'
      ? value
      : parseFloat(String(value ?? '0').replace(/[^0-9.-]/g, ''));

  if (isNaN(num)) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cur,
    }).format(0);
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Check whether a date-of-birth makes the person a minor (under 18).
 *
 * @example
 * ```ts
 * isMinorByDob('2015-06-01') // true  (if today is 2026)
 * isMinorByDob('2000-01-01') // false
 * isMinorByDob(undefined)    // false
 * ```
 */
export function isMinorByDob(dob: string | undefined): boolean {
  if (!dob) return false;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 18;
}

/**
 * Format an ISO date string (YYYY-MM-DD) as a short human-readable label.
 *
 * @example
 * ```ts
 * formatDateDisplay('2026-03-15') // 'Sun, Mar 15'  (en-US browser)
 * formatDateDisplay('')           // ''
 * ```
 */
/**
 * Extract the currency symbol for a given ISO 4217 currency code.
 *
 * @example
 * ```ts
 * getCurrencySymbol('USD') // '$'
 * getCurrencySymbol('EUR') // '€'
 * getCurrencySymbol('COP') // '$'
 * ```
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  return (
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? '$'
  );
}

/**
 * Format a duration in minutes to a human-readable string.
 *
 * @example
 * ```ts
 * formatDuration(30)  // '30 min'
 * formatDuration(60)  // '1h'
 * formatDuration(90)  // '1h 30min'
 * formatDuration(null) // ''
 * ```
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}min`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
