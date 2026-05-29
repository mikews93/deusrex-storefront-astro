import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  StorefrontContext,
  type StorefrontContextValue,
  type StorefrontData,
} from '@/storefront/context/storefront-context-value';
import { useStorefrontData } from '@/storefront/hooks/useStorefrontData';
import { ORG_SLUG } from '@/runtime/public-api-config';
import '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  },
});

/**
 * Provides the StorefrontContext the ported flow expects, sourced from the
 * published site's per-org config (ORG_SLUG) + the public storefront API.
 * `basePath` is '' because each published site is served at its own host root.
 */
function StorefrontContextProvider({ children }: { children: ReactNode }) {
  const { data } = useStorefrontData(ORG_SLUG);
  const [cartOpen, setCartOpen] = useState(false);

  const value: StorefrontContextValue = {
    isStorefront: true,
    orgSlug: ORG_SLUG,
    basePath: '',
    data: (data ?? { orgSlug: ORG_SLUG }) as StorefrontData,
    businessProfile: data?.businessProfile ?? null,
    currency: data?.currency ?? data?.organizationSettings?.currency ?? 'USD',
    fontFamilyCss: '',
    cartOpen,
    setCartOpen,
  };

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

/** Wrap every storefront island's content in this. */
export function StorefrontProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StorefrontContextProvider>{children}</StorefrontContextProvider>
    </QueryClientProvider>
  );
}