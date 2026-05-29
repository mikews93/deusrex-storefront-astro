import { useCallback } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { useStorefrontContext } from './useStorefront';

/**
 * Returns a formatCurrency function pre-bound to the org's currency.
 * Falls back to 'USD' outside the storefront context.
 */
export function useFormatCurrency() {
  const ctx = useStorefrontContext();
  const currency = ctx?.currency || 'USD';

  return useCallback(
    (value: string | number | null | undefined) =>
      formatCurrency(value, currency),
    [currency],
  );
}
