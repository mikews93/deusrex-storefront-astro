import { createContext } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Loose type for storefront data — backend returns dynamic shape */
export type StorefrontData = Record<string, any> & {
  orgSlug: string;
  businessProfile: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    description: string | null;
    [key: string]: any;
  } | null;
  website: {
    templateId: string | null;
    fontFamily: string | null;
    seoTitle: string | null;
    status: string;
    [key: string]: any;
  };
  products: any[];
  services: any[];
  courses: any[];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface StorefrontContextValue {
  isStorefront: true;
  orgSlug: string;
  /** URL prefix for storefront links. SPA: `/s/${orgSlug}`, published site: `""` */
  basePath: string;
  data: StorefrontData;
  businessProfile: StorefrontData['businessProfile'];
  currency: string;
  fontFamilyCss: string;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export const StorefrontContext = createContext<StorefrontContextValue | null>(
  null,
);
