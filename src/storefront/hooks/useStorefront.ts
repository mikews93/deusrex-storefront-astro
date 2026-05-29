import { useContext } from 'react';
import {
  StorefrontContext,
  type StorefrontContextValue,
} from '../context/storefront-context-value';

/** Use inside StorefrontLayout children — throws if no provider */
export function useStorefront(): StorefrontContextValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx)
    throw new Error('useStorefront must be used within StorefrontLayout');
  return ctx;
}

/** Nullable version for components that may render outside storefront (e.g. AddToCartButton) */
export function useStorefrontContext() {
  return useContext(StorefrontContext);
}
