import { useEffect, useState } from 'react';
import BookingFlow from './BookingFlow';
import {
  LOCALE,
  ORG_SLUG,
  PUBLIC_API_BASE_URL,
} from '../runtime/public-api-config';

/**
 * Thin island that extracts the service id from the URL (CloudFront rewrites
 * `/book/{serviceId}` → `/book/_detail.html`) and hands it to the existing
 * BookingFlow island. The runtime config (org slug, API base URL, locale)
 * comes from the per-org public-api-config module — no Astro `import.meta.env`.
 */
export default function BookingForService(): JSX.Element {
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prefix = '/book/';
    const path = window.location.pathname;
    if (path.startsWith(prefix)) {
      const tail = path.slice(prefix.length).replace(/\/$/, '');
      if (tail && tail !== '_detail') setServiceId(tail);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="sf-loading-state" aria-busy="true">
        <div className="sf-skeleton sf-skeleton--hero" />
      </div>
    );
  }

  return (
    <BookingFlow
      serviceId={serviceId}
      orgSlug={ORG_SLUG}
      apiUrl={PUBLIC_API_BASE_URL}
      locale={LOCALE}
    />
  );
}
