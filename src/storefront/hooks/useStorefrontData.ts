import { useQuery } from '@tanstack/react-query';
import { env } from '@/config/env';

const API_BASE = env.API_URL.replace('/trpc', '');

export function useStorefrontData(orgSlug: string) {
  return useQuery({
    queryKey: ['storefront', orgSlug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/storefront/${orgSlug}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Store not found' : 'Failed to load store');
      }
      return res.json();
    },
    enabled: !!orgSlug,
    staleTime: 5 * 60 * 1000,
  });
}
