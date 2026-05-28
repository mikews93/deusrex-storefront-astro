import { useCallback, useEffect, useState } from 'react';
import { ORG_SLUG, publicPath } from '../runtime/public-api-config';

/**
 * CartIsland — Spec 004 T034. Shared cart state for the published site.
 *
 * Subscribes to a `cart:add` DOM event so any page can add to the cart by:
 *   window.dispatchEvent(new CustomEvent('cart:add', {
 *     detail: { itemType: 'PRODUCT' | 'COURSE', itemId: string, quantity?: number }
 *   }))
 *
 * Cart state is persisted via the existing /public/cart endpoints. A
 * `sessionToken` is stored in localStorage so the cart survives navigation
 * and reloads.
 */

interface CartItem {
  id: string;
  itemType: 'PRODUCT' | 'COURSE';
  itemId: string;
  quantity: number;
  name?: string;
  // Decimal currency string from /public/cart (e.g. "49.99"), matching the
  // dashboard cart's CartItem shape — NOT integer cents.
  unitPrice?: string;
}

interface CartResponse {
  sessionToken: string;
  items: CartItem[];
}

function getOrCreateSessionToken(): string | null {
  // SSR-safe: returns null when there's no DOM.
  if (typeof window === 'undefined') return null;
  const key = `deusrex-cart-${ORG_SLUG}`;
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(key, token);
  }
  return token;
}

export default function CartIsland(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Resolved on mount (client only). null during SSR + before first paint.
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    setSessionToken(getOrCreateSessionToken());
  }, []);

  const refresh = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(
        publicPath(`/cart/${ORG_SLUG}/${sessionToken}`),
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = (await res.json()) as CartResponse;
      setItems(data.items ?? []);
    } catch {
      // Cart is best-effort UI — surface failures only as empty state.
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  // Initial load + cross-page add listener.
  useEffect(() => {
    if (!sessionToken) return;
    refresh();

    const handleAdd = (event: Event) => {
      const detail = (event as CustomEvent<{
        itemType: 'PRODUCT' | 'COURSE';
        itemId: string;
        quantity?: number;
      }>).detail;
      if (!detail?.itemId) return;

      void (async () => {
        try {
          await fetch(
            publicPath(`/cart/${ORG_SLUG}/${sessionToken}/items`),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemType: detail.itemType,
                itemId: detail.itemId,
                quantity: detail.quantity ?? 1,
              }),
            },
          );
          await refresh();
          setOpen(true);
        } catch {
          // Ignore; user can retry from UI.
        }
      })();
    };

    window.addEventListener('cart:add', handleAdd as EventListener);
    return () =>
      window.removeEventListener('cart:add', handleAdd as EventListener);
  }, [refresh, sessionToken]);

  const removeItem = async (itemId: string) => {
    if (!sessionToken) return;
    try {
      await fetch(
        publicPath(`/cart/${ORG_SLUG}/${sessionToken}/items/${itemId}`),
        { method: 'DELETE' },
      );
      await refresh();
    } catch {
      /* noop */
    }
  };

  const goCheckout = () => {
    // /checkout is a static Astro page; it'll initialize CheckoutResult on
    // return. Here we POST a checkout session and redirect to the URL the
    // backend returns (Stripe / etc.).
    void (async () => {
      try {
        const res = await fetch(publicPath(`/checkout/${ORG_SLUG}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              itemType: i.itemType,
              itemId: i.itemId,
              quantity: i.quantity,
            })),
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/checkout/cancel`,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { url?: string };
        if (data.url) window.location.assign(data.url);
      } catch {
        /* noop */
      }
    })();
  };

  const itemCount = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  return (
    <>
      <button
        type="button"
        className="sf-cart-trigger"
        aria-label={`Open cart (${itemCount} items)`}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">🛒</span>
        {itemCount > 0 && <span className="sf-cart-badge">{itemCount}</span>}
      </button>

      {open && (
        <div className="sf-cart-drawer" role="dialog" aria-modal="true">
          <div className="sf-cart-drawer__header">
            <h2>Cart ({itemCount})</h2>
            <button
              type="button"
              className="sf-cart-drawer__close"
              onClick={() => setOpen(false)}
              aria-label="Close cart"
            >
              ×
            </button>
          </div>
          {loading ? (
            <p className="sf-cart-drawer__empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="sf-cart-drawer__empty">Your cart is empty.</p>
          ) : (
            <ul className="sf-cart-drawer__list">
              {items.map((item) => (
                <li key={item.id} className="sf-cart-drawer__item">
                  <div>
                    <div className="sf-cart-drawer__item-name">
                      {item.name ?? item.itemType}
                    </div>
                    <div className="sf-cart-drawer__item-meta">
                      Qty {item.quantity}
                      {item.unitPrice != null
                        ? ` · $${parseFloat(item.unitPrice).toFixed(2)}`
                        : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sf-cart-drawer__remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <button
              type="button"
              className="sf-btn sf-btn--primary sf-cart-drawer__checkout"
              onClick={goCheckout}
            >
              Checkout
            </button>
          )}
        </div>
      )}
    </>
  );
}
