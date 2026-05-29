import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Check,
  Lock,
  CreditCard,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/sheet';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { env } from '@/config/env';
import { useCart } from '../hooks/useCart';
import { useStorefrontData } from '../hooks/useStorefrontData';
import { CartItemRow } from './CartItemRow';

const API_BASE = env.API_URL.replace('/trpc', '');

interface CartDrawerProps {
  orgSlug: string;
  basePath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({
  orgSlug,
  basePath,
  open,
  onOpenChange,
}: CartDrawerProps) {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    sessionToken,
  } = useCart(orgSlug);

  const { data: storefrontData } = useStorefrontData(orgSlug);
  const businessProfile = storefrontData?.businessProfile;

  /**
   * State
   */
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hooks
   */
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  /**
   * Handlers
   */
  const handleCheckout = async () => {
    if (!email) {
      setError(t('storefront.cart.emailRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await fetch(`${API_BASE}/public/cart/${orgSlug}/${sessionToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const res = await fetch(`${API_BASE}/public/checkout/${orgSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
          })),
          customerEmail: email,
          customerName: name || undefined,
          customerPhone: phone || undefined,
          successUrl: `${window.location.origin}${basePath}/checkout/success`,
          cancelUrl: `${window.location.origin}${basePath}/checkout/cancel`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStep('cart');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md border-none bg-(--brand-bg,#faf9f5)"
        style={
          {
            '--brand-primary': businessProfile?.primaryColor || '#0f172a',
            '--brand-secondary': businessProfile?.secondaryColor || '#0f172a',
          } as React.CSSProperties
        }
      >
        {/* Header with brand gradient */}
        <div className="shrink-0 px-6 pb-5 pt-8 bg-transparent">
          <SheetHeader className="p-0">
            <SheetTitle className="flex items-center gap-3 text-slate-900">
              {step === 'checkout' && (
                <button
                  onClick={() => setStep('cart')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 text-slate-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className="h-6 w-6"
                  style={{ color: 'var(--brand-primary)' }}
                />
                {step === 'cart'
                  ? `${t('storefront.cart.yourCart')} (${totalItems})`
                  : t('storefront.cart.checkout')}
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Step progress bar */}
          <div className="mt-8 flex items-center gap-2">
            {['cart', 'checkout'].map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s === 'cart' || (s === 'checkout' && step === 'checkout')
                      ? 'bg-slate-800'
                      : 'bg-slate-200'
                  }`}
                  style={
                    s === 'cart' || (s === 'checkout' && step === 'checkout')
                      ? { backgroundColor: 'var(--brand-primary)' }
                      : undefined
                  }
                />
                {i === 0 && (
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      step === 'checkout' ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                    style={
                      step === 'checkout'
                        ? { backgroundColor: 'var(--brand-primary)' }
                        : undefined
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" initial={false}>
          {step === 'cart' ? (
            <motion.div
              key="cart"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-slate-400"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5">
                      <ShoppingBag className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="mt-6 text-base font-semibold text-slate-900">
                      {t('storefront.cart.emptyCart')}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 text-center max-w-xs leading-relaxed">
                      {t(
                        'storefront.cart.addItemsHint',
                        'Browse our products and courses',
                      )}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.itemId}
                        item={item}
                        onUpdateQuantity={(itemId, qty) =>
                          updateQuantity({ itemId, quantity: qty })
                        }
                        onRemove={(itemId) => removeItem(itemId)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="shrink-0 bg-transparent px-6 pb-8 pt-4">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-500">
                      {t('storefront.cart.total')}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('checkout')}
                    className="flex w-full items-center justify-center gap-3 rounded-full py-5 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background:
                        'linear-gradient(to right, var(--brand-primary, #0f172a), color-mix(in srgb, var(--brand-primary, #0f172a) 70%, transparent))',
                    }}
                  >
                    {t('storefront.cart.proceedToCheckout')}
                    <CreditCard className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Checkout form */}
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <p className="text-sm text-slate-500">
                  {t('storefront.cart.enterDetails')}
                </p>

                {/* Email field */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {t('storefront.cart.email')} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t(
                      'storefront.cart.emailPlaceholder',
                      'your@email.com',
                    )}
                    className="w-full rounded-2xl border-none bg-white p-4 text-base text-slate-900 shadow-sm ring-1 ring-slate-900/5 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    required
                  />
                </div>

                {/* Name field */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    {t('storefront.cart.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t(
                      'storefront.cart.namePlaceholder',
                      'Your name',
                    )}
                    className="w-full rounded-2xl border-none bg-white p-4 text-base text-slate-900 shadow-sm ring-1 ring-slate-900/5 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {t('storefront.cart.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-2xl border-none bg-white p-4 text-base text-slate-900 shadow-sm ring-1 ring-slate-900/5 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* Order summary */}
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-multiply opacity-5 blur-2xl pointer-events-none"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 relative z-10">
                    <ShoppingBag className="h-4 w-4" />
                    {t('storefront.cart.orderSummary')}
                  </h4>
                  <div className="mt-4 space-y-3 relative z-10">
                    {items.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex justify-between text-sm"
                      >
                        <span className="line-clamp-1 text-slate-600">
                          {item.itemName}
                          {item.quantity > 1 && (
                            <span className="ml-1 text-slate-400">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-bold text-slate-900">
                          {formatPrice(
                            parseFloat(item.unitPrice) * item.quantity,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-slate-900/5 pt-4 text-sm font-bold text-slate-900 relative z-10">
                    <span>{t('storefront.cart.total')}</span>
                    <span
                      className="text-lg font-black"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout button + trust signals */}
              <div className="shrink-0 bg-transparent px-6 pb-8 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={isSubmitting || !email}
                  className="flex w-full items-center justify-center gap-3 rounded-full py-5 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:shadow-none disabled:opacity-50"
                  style={{
                    background:
                      'linear-gradient(to right, var(--brand-primary, #0f172a), color-mix(in srgb, var(--brand-primary, #0f172a) 70%, transparent))',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white/70" />
                      {t('storefront.cart.processing')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      {`${t('storefront.cart.completePurchase')} ${formatPrice(totalPrice)}`}
                    </>
                  )}
                </motion.button>

                {/* Trust signals */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t('storefront.cart.stripeRedirect')}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {t(
                      'storefront.cart.secureCheckout',
                      'Secure 256-bit SSL checkout',
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
