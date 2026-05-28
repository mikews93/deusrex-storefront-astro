import { useEffect, useState } from 'react';
import { v1 } from '../../runtime/public-api-config';

/**
 * Spec 004 — the rest of the home-page islands. Kept in one file because
 * they share the fetch-or-null pattern (load → empty-hides-section → render).
 *
 * Each is exported separately so Astro can hydrate them independently.
 */

// ── Shared types + hook ────────────────────────────────────────────────

interface SectionMeta {
  title?: string;
  subtitle?: string;
}

function useApi<T>(path: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(v1(path));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error };
}

// ── Testimonials ───────────────────────────────────────────────────────

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  content: string;
  rating: number | null;
}

export function TestimonialsIsland({
  title,
  subtitle,
}: SectionMeta): JSX.Element | null {
  const { data, loading, error } = useApi<Testimonial[]>('/testimonials');
  if (error) {
    console.warn(`[TestimonialsIsland] ${error}`);
    return null;
  }
  if (loading) return <SectionSkeleton title={title} subtitle={subtitle} />;
  if (!data || data.length === 0) return null;

  return (
    <section className="sc-section sc-testimonials-section">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-card-grid">
        {data.map((t) => (
          <article key={t.id} className="sc-card sc-testimonial-card">
            <blockquote className="sc-testimonial__content">
              {t.content}
            </blockquote>
            <footer className="sc-testimonial__footer">
              <span className="sc-testimonial__author">{t.authorName}</span>
              {t.authorRole && (
                <span className="sc-testimonial__role">{t.authorRole}</span>
              )}
              {t.rating != null && (
                <span
                  className="sc-testimonial__rating"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {'★'.repeat(Math.max(0, Math.min(5, t.rating)))}
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── FAQs ───────────────────────────────────────────────────────────────

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export function FaqsIsland({
  title,
  subtitle,
}: SectionMeta): JSX.Element | null {
  const { data, loading, error } = useApi<Faq[]>('/faqs');
  if (error) {
    console.warn(`[FaqsIsland] ${error}`);
    return null;
  }
  if (loading) return <SectionSkeleton title={title} subtitle={subtitle} />;
  if (!data || data.length === 0) return null;

  return (
    <section className="sc-section sc-faq-section">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-faq-list">
        {data.map((f) => (
          <details key={f.id} className="sc-faq-item">
            <summary className="sc-faq-item__question">{f.question}</summary>
            <div className="sc-faq-item__answer">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Policies ───────────────────────────────────────────────────────────

interface Policy {
  id: string;
  title: string;
  content: string;
}

export function PoliciesIsland({
  title,
  subtitle,
}: SectionMeta): JSX.Element | null {
  const { data, loading, error } = useApi<Policy[]>('/policies');
  if (error) {
    console.warn(`[PoliciesIsland] ${error}`);
    return null;
  }
  if (loading) return <SectionSkeleton title={title} subtitle={subtitle} />;
  if (!data || data.length === 0) return null;

  return (
    <section className="sc-section sc-policies-section">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-policies-list">
        {data.map((p) => (
          <details key={p.id} className="sc-policy-item">
            <summary className="sc-policy-item__title">{p.title}</summary>
            <div className="sc-policy-item__content">{p.content}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Locations ──────────────────────────────────────────────────────────

interface Location {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
}

export function LocationsIsland({
  title,
  subtitle,
}: SectionMeta): JSX.Element | null {
  const { data, loading, error } = useApi<Location[]>('/locations');
  if (error) {
    console.warn(`[LocationsIsland] ${error}`);
    return null;
  }
  if (loading) return <SectionSkeleton title={title} subtitle={subtitle} />;
  if (!data || data.length === 0) return null;

  return (
    <section className="sc-section sc-locations-section">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-card-grid">
        {data.map((l) => (
          <article key={l.id} className="sc-card sc-location-card">
            <h3 className="sc-card__title">{l.name}</h3>
            {l.address && <p className="sc-location__address">{l.address}</p>}
            {l.phone && (
              <a href={`tel:${l.phone}`} className="sc-location__phone">
                {l.phone}
              </a>
            )}
            {l.email && (
              <a href={`mailto:${l.email}`} className="sc-location__email">
                {l.email}
              </a>
            )}
            {l.description && (
              <p className="sc-location__desc">{l.description}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Contact ────────────────────────────────────────────────────────────

interface BusinessProfile {
  name: string;
  description: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
}

export function ContactIsland({
  title,
  subtitle,
}: SectionMeta): JSX.Element | null {
  const { data, loading, error } = useApi<BusinessProfile>('/business-profile');
  if (error) {
    console.warn(`[ContactIsland] ${error}`);
    return null;
  }
  if (loading) return <SectionSkeleton title={title} subtitle={subtitle} />;
  if (!data) return null;

  const hasAny = data.address || data.contactEmail || data.contactPhone;
  if (!hasAny) return null;

  return (
    <section className="sc-section sc-contact-section">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-contact-block">
        {data.address && (
          <p className="sc-contact__address">{data.address}</p>
        )}
        {data.contactPhone && (
          <a
            href={`tel:${data.contactPhone}`}
            className="sc-contact__phone"
          >
            {data.contactPhone}
          </a>
        )}
        {data.contactEmail && (
          <a
            href={`mailto:${data.contactEmail}`}
            className="sc-contact__email"
          >
            {data.contactEmail}
          </a>
        )}
        <SocialIconRow profile={data} />
      </div>
    </section>
  );
}

// ── Footer social ──────────────────────────────────────────────────────

export function FooterSocialIsland(): JSX.Element | null {
  const { data, loading, error } = useApi<BusinessProfile>('/business-profile');
  if (error) {
    console.warn(`[FooterSocialIsland] ${error}`);
    return null;
  }
  if (loading) return null;
  if (!data) return null;
  return <SocialIconRow profile={data} />;
}

// ── Shared sub-components ──────────────────────────────────────────────

function SectionSkeleton({
  title,
  subtitle,
}: SectionMeta): JSX.Element {
  return (
    <section className="sc-section sc-section--loading" aria-busy="true">
      {title && <h2 className="sc-section__title">{title}</h2>}
      {subtitle && <p className="sc-section__subtitle">{subtitle}</p>}
      <div className="sc-card-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="sc-card sc-skeleton" />
        ))}
      </div>
    </section>
  );
}

const SOCIALS: { key: keyof BusinessProfile; label: string }[] = [
  { key: 'instagramUrl', label: 'Instagram' },
  { key: 'facebookUrl', label: 'Facebook' },
  { key: 'twitterUrl', label: 'Twitter / X' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
  { key: 'tiktokUrl', label: 'TikTok' },
  { key: 'websiteUrl', label: 'Website' },
];

function SocialIconRow({
  profile,
}: {
  profile: BusinessProfile;
}): JSX.Element | null {
  const links = SOCIALS.flatMap(({ key, label }) => {
    const href = profile[key];
    return typeof href === 'string' && href ? [{ key, label, href }] : [];
  });
  if (links.length === 0) return null;
  return (
    <div className="sc-social-row">
      {links.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`sc-social-icon sc-social-icon--${key.replace('Url', '')}`}
        >
          {label}
        </a>
      ))}
    </div>
  );
}
