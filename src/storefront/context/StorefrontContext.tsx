import { useState, type ReactNode } from 'react';
import {
  StorefrontContext,
  type StorefrontData,
} from './storefront-context-value';

export type {
  StorefrontData,
  StorefrontContextValue,
} from './storefront-context-value';
export { StorefrontContext } from './storefront-context-value';

export function StorefrontProvider({
  orgSlug,
  basePath,
  data,
  fontFamilyCss,
  children,
}: {
  orgSlug: string;
  /** URL prefix for links. SPA: `/s/${orgSlug}`, published site: `""` */
  basePath?: string;
  data: StorefrontData;
  fontFamilyCss: string;
  children: ReactNode;
}) {
  /** State */
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <StorefrontContext.Provider
      value={{
        isStorefront: true,
        orgSlug,
        basePath: basePath ?? `/s/${orgSlug}`,
        data,
        businessProfile: data.businessProfile,
        currency: (data.currency as string) || 'USD',
        fontFamilyCss,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}
