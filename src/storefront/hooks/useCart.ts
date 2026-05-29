import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { env } from '@/config/env';

const API_BASE = env.API_URL.replace('/trpc', '');

function getSessionToken(orgSlug: string): string {
  // SSR-safe: Astro prerenders the island's initial HTML server-side where
  // there's no localStorage. Return '' there; the real token is resolved on
  // the client and the cart query is gated on it.
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return '';
  }
  const key = `deusrex-cart-${orgSlug}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

interface CartItem {
  id: string;
  cartId: string;
  itemType: string;
  itemId: string;
  itemName: string;
  unitPrice: string;
  imageUrl: string | null;
  quantity: number;
}

interface Cart {
  id: string;
  sessionToken: string;
  customerEmail: string | null;
  customerName: string | null;
  status: string;
}

interface CartResponse {
  cart: Cart;
  items: CartItem[];
}

async function cartFetch(
  path: string,
  options?: RequestInit,
): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error('Cart operation failed');
  }
  return res.json();
}

export function useCart(orgSlug: string) {
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken(orgSlug);
  const queryKey = ['cart', orgSlug, sessionToken];

  const cartQuery = useQuery({
    queryKey,
    queryFn: () =>
      cartFetch(`/public/cart/${orgSlug}/${sessionToken}`),
    enabled: !!orgSlug && !!sessionToken,
    staleTime: 30 * 1000,
  });

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey });

  const addItemMutation = useMutation({
    mutationFn: (input: {
      itemType: 'PRODUCT' | 'COURSE';
      itemId: string;
      quantity?: number;
    }) =>
      cartFetch(`/public/cart/${orgSlug}/${sessionToken}/items`, {
        method: 'POST',
        body: JSON.stringify({
          itemType: input.itemType,
          itemId: input.itemId,
          quantity: input.quantity ?? 1,
        }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) =>
      cartFetch(
        `/public/cart/${orgSlug}/${sessionToken}/items/${input.itemId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ quantity: input.quantity }),
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      cartFetch(
        `/public/cart/${orgSlug}/${sessionToken}/items/${itemId}`,
        { method: 'DELETE' },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const updateCustomerInfoMutation = useMutation({
    mutationFn: (info: { email?: string; name?: string }) =>
      fetch(`${API_BASE}/public/cart/${orgSlug}/${sessionToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update customer info');
        return res.json();
      }),
    onSuccess: () => invalidateCart(),
  });

  const items = cartQuery.data?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0,
  );

  return {
    items,
    cart: cartQuery.data?.cart ?? null,
    isLoading: cartQuery.isLoading,
    totalItems,
    totalPrice,
    sessionToken,
    addItem: addItemMutation.mutate,
    addItemAsync: addItemMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateCustomerInfo: updateCustomerInfoMutation.mutate,
  };
}
