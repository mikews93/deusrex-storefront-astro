import { useEffect, useState } from 'react';
import { StorefrontProviders } from './StorefrontProviders';
import BookingPage from '@/storefront/pages/BookingPage';

/**
 * /book island. Extracts the service id from the URL (`/book/{serviceId}`,
 * CloudFront rewrites to detail.html but the browser path is preserved) and
 * renders the real ported booking flow. `/book` with no id shows the
 * service-selection step.
 */
export default function BookingForService() {
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prefix = '/book/';
    const path = window.location.pathname;
    if (path.startsWith(prefix)) {
      const tail = path.slice(prefix.length).replace(/\/$/, '');
      if (tail && tail !== '_detail' && tail !== 'detail') setServiceId(tail);
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
    <StorefrontProviders>
      <BookingPage serviceId={serviceId} />
    </StorefrontProviders>
  );
}