/**
 * CheckoutResult — React Island (client:load).
 * Self-contained: no React Router, no StorefrontContext.
 * Handles cart session cleanup on success, preserves cart on cancel.
 */
import { useEffect } from 'react';

interface CheckoutResultProps {
  status: 'success' | 'cancelled';
  orgSlug: string;
  apiUrl: string;
}

export default function CheckoutResult({
  status,
  orgSlug,
  apiUrl,
}: CheckoutResultProps) {
  useEffect(() => {
    if (status === 'success') {
      // Single canonical cart key (matches CartIsland + the dashboard's
      // useCart): the value stored here IS the cart session token.
      const key = `deusrex-cart-${orgSlug}`;
      const sessionToken = localStorage.getItem(key);
      // Mark the cart converted on the backend BEFORE clearing the token.
      if (sessionToken) {
        const apiBase = apiUrl.replace('/trpc', '');
        fetch(`${apiBase}/public/cart/${orgSlug}/${sessionToken}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CONVERTED' }),
        }).catch(() => {});
      }
      // Clear cart identity so the next visit starts a fresh cart.
      localStorage.removeItem(key);
    }
  }, [status, orgSlug, apiUrl]);

  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      {status === 'success' ? (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '2rem',
            }}
          >
            &#10003;
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Thank you for your purchase!
          </h2>
          <p style={{ color: '#666', marginTop: '0.75rem' }}>
            Your order has been confirmed.
          </p>
          <a
            href="/store"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: 'var(--brand-primary, #0f172a)',
              textDecoration: 'none',
            }}
          >
            &larr; Back to Store
          </a>
        </>
      ) : (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '2rem',
            }}
          >
            &#10005;
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Checkout Cancelled
          </h2>
          <p style={{ color: '#666', marginTop: '0.75rem' }}>
            Your cart has been saved. You can complete checkout anytime.
          </p>
          <a
            href="/store"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: 'var(--brand-primary, #0f172a)',
              textDecoration: 'none',
            }}
          >
            Continue Shopping &rarr;
          </a>
        </>
      )}
    </div>
  );
}
