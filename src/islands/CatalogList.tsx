import { useEffect, useState } from 'react';
import { v1 } from '../runtime/public-api-config';
import { StorefrontProviders } from './StorefrontProviders';
import { useFormatCurrency } from '@/storefront/hooks/useFormatCurrency';

/**
 * Dynamic-shell list view for services, products, and courses (Spec 004 FR-003).
 *
 * Fetches the catalog client-side from `/api/v1/{section}` so the published
 * Astro build is independent of catalog size and content. Renders loading,
 * empty, and error states without 404'ing the underlying route (FR-003a).
 */

type Section = 'services' | 'products' | 'courses';

interface CatalogItem {
  id: string;
  // Services + products use `name`; courses use `title`. We coalesce on read.
  name?: string;
  title?: string;
  description?: string | null;
  price?: number | null;
  duration?: number | null;
  imageUrl?: string | null;
}

interface CatalogListProps {
  section: Section;
  detailPathBase: string; // e.g. '/services', '/store', '/courses'
  emptyState: { title: string; description: string };
  // Optional render override per section (e.g. courses want a different price layout)
  itemLabel?: (item: CatalogItem) => string;
}

function CatalogListInner({
  section,
  detailPathBase,
  emptyState,
  itemLabel,
}: CatalogListProps): JSX.Element {
  const formatCurrency = useFormatCurrency();
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiSection = section === 'products' ? 'products' : section;
        const res = await fetch(v1(`/${apiSection}`));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CatalogItem[];
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [section]);

  if (error !== null) {
    return (
      <div className="sf-error-state" role="alert">
        <h2>Something went wrong</h2>
        <p>We couldn't load this page right now. Please refresh to try again.</p>
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

  if (items === null) {
    return (
      <div className="sf-loading-state" aria-busy="true" aria-live="polite">
        <div className="sf-skeleton sf-skeleton--card" />
        <div className="sf-skeleton sf-skeleton--card" />
        <div className="sf-skeleton sf-skeleton--card" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="sf-empty-state">
        <h2>{emptyState.title}</h2>
        <p>{emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="sf-catalog-grid">
      {items.map((item) => {
        const label = itemLabel?.(item) ?? item.name ?? item.title ?? '';
        return (
          <a
            key={item.id}
            href={`${detailPathBase}/${item.id}`}
            className="sf-catalog-card"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={label}
                className="sf-catalog-card__image"
                loading="lazy"
              />
            )}
            <div className="sf-catalog-card__body">
              <h3 className="sf-catalog-card__title">{label}</h3>
              {item.description && (
                <p className="sf-catalog-card__description">
                  {item.description}
                </p>
              )}
              <div className="sf-catalog-card__meta">
                {item.duration != null && (
                  <span className="sf-badge">{item.duration} min</span>
                )}
                {item.price != null && (
                  <span className="sf-catalog-card__price">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

/**
 * Wrap in StorefrontProviders so the catalog list can format prices in the
 * org's currency (COP / USD / …) via useFormatCurrency, matching the cart
 * drawer's "COP 20,000.00" formatting instead of a bare "$".
 */
export default function CatalogList(props: CatalogListProps) {
  return (
    <StorefrontProviders>
      <CatalogListInner {...props} />
    </StorefrontProviders>
  );
}
