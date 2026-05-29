import { PUBLIC_API_BASE_URL } from '@/runtime/public-api-config';

/**
 * Shim for the dashboard's `@/config/env`. The ported storefront hooks
 * (useBooking, useStorefrontData) read `env.API_URL` and strip a trailing
 * `/trpc`. On the published site the base is the per-org public API base that
 * the generator injects into public-api-config — already without `/trpc`, so
 * the strip is a harmless no-op.
 */
export const env = {
  API_URL: PUBLIC_API_BASE_URL,
};