import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useStorefrontContext } from '../hooks/useStorefront';
import { useCart } from '../hooks/useCart';

interface AddToCartButtonProps {
  itemId: string;
  itemType: 'PRODUCT' | 'COURSE';
  name: string;
  price: string;
  imageUrl?: string | null;
  variant: 'product' | 'course';
  className?: string;
}

function LiveAddToCartButton({
  itemId,
  itemType,
  orgSlug,
  variant,
  className,
}: {
  itemId: string;
  itemType: 'PRODUCT' | 'COURSE';
  orgSlug: string;
  variant: 'product' | 'course';
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);
  const { addItemAsync, isAdding } = useCart(orgSlug);
  const { t } = useTranslation();

  const handleClick = async () => {
    if (isAdding) return;
    setError(false);
    try {
      await addItemAsync({ itemType, itemId, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error('[AddToCart] Failed to add item:', err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (variant === 'course') {
    return (
      <button
        onClick={handleClick}
        disabled={added || isAdding}
        className={
          className ||
          `rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-70 ${
            error ? 'bg-red-500' : 'bg-teal-600 hover:bg-teal-700'
          }`
        }
      >
        {error ? (
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            {t('storefront.cart.error', 'Error')}
          </span>
        ) : added ? (
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            {t('storefront.cart.added')}
          </span>
        ) : (
          t('storefront.cart.enrollNow')
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={added || isAdding}
      className={
        className ||
        'mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-70'
      }
      style={{
        backgroundColor: error ? '#ef4444' : 'var(--brand-primary, #2563eb)',
      }}
    >
      {error ? (
        <>
          <AlertCircle className="h-4 w-4" />
          {t('storefront.cart.error', 'Error')}
        </>
      ) : added ? (
        <>
          <Check className="h-4 w-4" />
          {t('storefront.cart.addedToCart')}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {t('storefront.cart.addToCart')}
        </>
      )}
    </button>
  );
}

function PreviewButton({
  variant,
  className,
}: {
  variant: 'product' | 'course';
  className?: string;
}) {
  const { t } = useTranslation();

  if (variant === 'course') {
    return (
      <button
        disabled
        className="cursor-default rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white opacity-60"
      >
        {t('storefront.cart.enrollNow')}
      </button>
    );
  }

  return (
    <button
      disabled
      className={
        className ||
        'mt-4 flex w-full cursor-default items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white opacity-60'
      }
      style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
    >
      <ShoppingCart className="h-4 w-4" />
      {t('storefront.cart.addToCart')}
    </button>
  );
}

export function AddToCartButton(props: AddToCartButtonProps) {
  const storefrontCtx = useStorefrontContext();

  if (!storefrontCtx) {
    return (
      <PreviewButton variant={props.variant} className={props.className} />
    );
  }

  return (
    <LiveAddToCartButton
      itemId={props.itemId}
      itemType={props.itemType}
      orgSlug={storefrontCtx.orgSlug}
      variant={props.variant}
      className={props.className}
    />
  );
}
