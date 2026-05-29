import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { StorefrontProviders } from './StorefrontProviders';
import { CartButton } from '@/storefront/components/CartButton';
import { CartDrawer } from '@/storefront/components/CartDrawer';
import { useCart } from '@/storefront/hooks/useCart';
import { ORG_SLUG } from '@/runtime/public-api-config';

/**
 * CartIsland — the single cart authority for the published site, now using the
 * real ported CartButton + CartDrawer (themed + i18n). Catalog/detail islands
 * still add via the `cart:add` DOM event; we forward it to useCart so the
 * (server-backed, sessionToken-persisted) cart stays in sync across islands.
 */
/**
 * Portals children into the platform FAB stack (`#sc-fab-stack`, rendered by
 * BaseLayout). Keeps the cart button under React's control while DOM-locating
 * it inside the shared floating-action container so it never collides with the
 * WhatsApp / chat buttons. Falls back to inert if the stack isn't present.
 */
function FabPortal({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setNode(document.getElementById('sc-fab-stack'));
  }, []);
  return node ? createPortal(children, node) : null;
}

function CartInner() {
  const [open, setOpen] = useState(false);
  const { addItem } = useCart(ORG_SLUG);

  useEffect(() => {
    const handleAdd = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          itemType: 'PRODUCT' | 'COURSE';
          itemId: string;
          quantity?: number;
        }>
      ).detail;
      if (!detail?.itemId) return;
      addItem({
        itemType: detail.itemType,
        itemId: detail.itemId,
        quantity: detail.quantity ?? 1,
      });
      setOpen(true);
    };
    window.addEventListener('cart:add', handleAdd as EventListener);
    return () =>
      window.removeEventListener('cart:add', handleAdd as EventListener);
  }, [addItem]);

  return (
    <>
      <FabPortal>
        <CartButton orgSlug={ORG_SLUG} onClick={() => setOpen(true)} />
      </FabPortal>
      <CartDrawer
        orgSlug={ORG_SLUG}
        basePath=""
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export default function CartIsland() {
  return (
    <StorefrontProviders>
      <CartInner />
    </StorefrontProviders>
  );
}