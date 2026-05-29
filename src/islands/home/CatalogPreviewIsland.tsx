import { useEffect, useState } from 'react';
import { v1 } from '../../runtime/public-api-config';
import { StorefrontProviders } from '../StorefrontProviders';
import { useFormatCurrency } from '@/storefront/hooks/useFormatCurrency';

/**
 * Home-page preview for services / products / courses (Spec 004).
 *
 * Replaces the legacy `<script>fetch(...)` blocks in the AI bundle. The
 * Astro generator swaps every `<section data-section="services|products|courses">`
 * placeholder for this island.
 *
 * Layout: flex-wrap + justify-center so the grid adapts to any item count
 * (1, 2, 3, 4, 5, 6 cards all center-aligned without weird gaps).
 *
 * If the org has zero items of this type, the island renders null — the
 * section header + grid + "view all" link disappear entirely. New orgs
 * don't get an awkward "Servicios" heading over nothing.
 */

type Kind = 'services' | 'products' | 'courses';

interface CatalogItem {
  id: string;
  name?: string; // services / products
  title?: string; // courses
  description?: string | null;
  price?: number | null;
  duration?: number | null;
  imageUrl?: string | null;
}

interface CatalogPreviewProps {
  section: Kind;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const KIND_TO_PATH: Record<Kind, string> = {
  services: '/services',
  products: '/products',
  courses: '/courses',
};

const KIND_TO_DETAIL_BASE: Record<Kind, string> = {
  services: '/services',
  products: '/store',
  courses: '/courses',
};

const KIND_TO_CTA: Record<Kind, string> = {
  services: 'Reservar →',
  products: 'Ver producto →',
  courses: 'Ver curso →',
};

const KIND_TO_VIEW_ALL: Record<Kind, string> = {
  services: 'Ver todos los servicios →',
  products: 'Ver toda la tienda →',
  courses: 'Ver todos los cursos →',
};

function CatalogPreviewIslandInner(
  props: CatalogPreviewProps,
): JSX.Element | null {
  const formatCurrency = useFormatCurrency();
  const { section, title, subtitle, limit = 6 } = props;
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(v1(`/${section}`));
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
    // Soft-fail — don't break the home page over a bad fetch. Logged in the
    // browser console for debugging.
    console.warn(`[CatalogPreview/${section}] ${error}`);
    return null;
  }

  if (items === null) {
    return (
      <section className="sc-section sc-section--loading" aria-busy="true">
        {title && <h2 className="sc-section__title">{title}</h2>}
        {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
        <div className="sc-card-grid">
          {Array.from({ length: Math.min(3, limit) }).map((_, i) => (
            <div key={i} className="sc-card sc-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    // FR-003a — empty data hides the entire section (no awkward header).
    return null;
  }

  const visible = items.slice(0, limit);
  const detailBase = KIND_TO_DETAIL_BASE[section];
  const viewAllHref = KIND_TO_PATH[section];

  return (
    <section className={`sc-section sc-${section}-section`}>
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-card-grid">
        {visible.map((item) => {
          const label = item.name ?? item.title ?? '';
          return (
            <a
              key={item.id}
              href={`${detailBase}/${item.id}`}
              className="sc-card"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={label}
                  className="sc-card__image"
                  loading="lazy"
                />
              )}
              <div className="sc-card__body">
                <h3 className="sc-card__title">{label}</h3>
                {item.description && (
                  <p className="sc-card__desc">{item.description}</p>
                )}
                <div className="sc-card__meta">
                  {item.duration != null && (
                    <span className="sc-card__duration">
                      {item.duration} min
                    </span>
                  )}
                  {item.price != null && (
                    <span className="sc-card__price">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                </div>
                <span className="sc-card__cta">{KIND_TO_CTA[section]}</span>
              </div>
            </a>
          );
        })}
      </div>
      {items.length > limit && (
        <a href={viewAllHref} className="sc-section__view-all">
          {KIND_TO_VIEW_ALL[section]}
        </a>
      )}
    </section>
  );
}

export default function CatalogPreviewIsland(props: CatalogPreviewProps) {
  return (
    <StorefrontProviders>
      <CatalogPreviewIslandInner {...props} />
    </StorefrontProviders>
  );
}
