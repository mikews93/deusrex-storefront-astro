import { useEffect, useState } from 'react';
import { ORG_SLUG, publicPath, v1 } from '../runtime/public-api-config';
import { formatPrice } from '../utils/format-price';

/**
 * Dynamic-shell detail view (Spec 004 FR-003). The CloudFront Function
 * rewrites `/{section}/{id}` → `/{section}/_detail.html`, so this island is
 * served at `_detail.html` and reads the real id from `window.location.pathname`.
 */

type Section = 'services' | 'products' | 'courses';

interface CatalogDetailItem {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  price?: number | null;
  duration?: number | null;
  imageUrl?: string | null;
  images?: { id: string; url: string; caption?: string | null }[];
}

interface CatalogDetailProps {
  section: Section;
  backHref: string; // e.g. '/services'
  // Whether to show a "Book Appointment" CTA (services only).
  showBookingCta?: boolean;
}

function extractIdFromPath(section: Section): string | null {
  if (typeof window === 'undefined') return null;
  const prefix =
    section === 'services'
      ? '/services/'
      : section === 'products'
        ? '/store/'
        : '/courses/';
  const path = window.location.pathname;
  if (!path.startsWith(prefix)) return null;
  const tail = path.slice(prefix.length);
  // Strip trailing slash if Astro's file-format ever introduces one.
  return tail.replace(/\/$/, '') || null;
}

async function fetchDetail(
  section: Section,
  id: string,
): Promise<CatalogDetailItem | null> {
  if (section === 'products') {
    // `/public/store/:orgSlug/products/:id` returns images[] — richer than the
    // v1 endpoint, so prefer it for the product-detail shell.
    const res = await fetch(publicPath(`/store/${ORG_SLUG}/products/${id}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CatalogDetailItem>;
  }

  if (section === 'services') {
    const res = await fetch(v1(`/services/${id}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CatalogDetailItem>;
  }

  // No /api/v1/courses/:id endpoint exists (confirmed in T004 audit). Fall
  // back to filtering the list response client-side.
  const res = await fetch(v1('/courses'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const list = (await res.json()) as CatalogDetailItem[];
  return list.find((c) => c.id === id) ?? null;
}

export default function CatalogDetail({
  section,
  backHref,
  showBookingCta,
}: CatalogDetailProps): JSX.Element {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'not-found' }
    | { kind: 'error'; message: string }
    | { kind: 'loaded'; item: CatalogDetailItem }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const id = extractIdFromPath(section);
    if (!id) {
      setState({ kind: 'not-found' });
      return;
    }

    (async () => {
      try {
        const item = await fetchDetail(section, id);
        if (cancelled) return;
        setState(item ? { kind: 'loaded', item } : { kind: 'not-found' });
      } catch (err) {
        if (!cancelled) {
          setState({ kind: 'error', message: (err as Error).message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [section]);

  if (state.kind === 'loading') {
    return (
      <div className="sf-loading-state" aria-busy="true" aria-live="polite">
        <div className="sf-skeleton sf-skeleton--hero" />
        <div className="sf-skeleton sf-skeleton--text" />
        <div className="sf-skeleton sf-skeleton--text" />
      </div>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <div className="sf-empty-state">
        <h2>Not found</h2>
        <p>We couldn't find what you were looking for.</p>
        <a href={backHref} className="sf-btn sf-btn--primary">
          Back
        </a>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="sf-error-state" role="alert">
        <h2>Something went wrong</h2>
        <p>Please refresh to try again.</p>
        <button
          type="button"
          className="sf-btn sf-btn--primary"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { item } = state;
  const label = item.name ?? item.title ?? '';

  return (
    <div className="sf-container sf-detail">
      <a href={backHref} className="sf-back-link">
        ← Back
      </a>
      <div className="sf-detail__layout">
        {item.imageUrl && (
          <div className="sf-detail__image-wrap">
            <img
              src={item.imageUrl}
              alt={label}
              className="sf-detail__image"
            />
          </div>
        )}
        <div className="sf-detail__info">
          <h1 className="sf-detail__title">{label}</h1>
          {item.description && (
            <p className="sf-detail__description">{item.description}</p>
          )}
          <div className="sf-detail__meta">
            {item.duration != null && (
              <span className="sf-badge">{item.duration} min</span>
            )}
            {item.price != null && (
              <span className="sf-detail__price">
                ${formatPrice(item.price)}
              </span>
            )}
          </div>
          {showBookingCta && (
            <a href={`/book/${item.id}`} className="sf-btn sf-btn--primary">
              Book Appointment
            </a>
          )}
          {section === 'products' && (
            <button
              type="button"
              className="sf-btn sf-btn--primary"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('cart:add', {
                    detail: { itemType: 'PRODUCT', itemId: item.id, quantity: 1 },
                  }),
                );
              }}
            >
              Add to cart
            </button>
          )}
          {section === 'courses' && (
            <button
              type="button"
              className="sf-btn sf-btn--primary"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('cart:add', {
                    detail: { itemType: 'COURSE', itemId: item.id, quantity: 1 },
                  }),
                );
              }}
            >
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
