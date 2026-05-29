import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, BookOpen, Package } from 'lucide-react';
import { useFormatCurrency } from '../hooks/useFormatCurrency';

interface CartItemRowProps {
  item: {
    itemId: string;
    itemType: string;
    itemName: string;
    unitPrice: string;
    imageUrl: string | null;
    quantity: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  /**
   * Hooks
   */
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  /**
   * Conditional rendering
   */
  const lineTotal = parseFloat(item.unitPrice) * item.quantity;
  const isCourse = item.itemType === 'COURSE';
  const ItemIcon = isCourse ? BookOpen : Package;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative rounded-3xl bg-white p-4 pr-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgb(0,0,0,0.08)]"
    >
      <div className="flex gap-4">
        {/* Image / Icon */}
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50 transition-colors group-hover:bg-slate-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ItemIcon className="h-8 w-8 opacity-30 text-slate-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between min-w-0 py-1">
          <div>
            <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug transition-colors group-hover:text-[var(--brand-primary)]">
              {item.itemName}
            </h4>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {formatPrice(parseFloat(item.unitPrice))}{' '}
              {t('storefront.cart.each', 'each')}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {/* Quantity controls */}
            {isCourse ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {t('storefront.cart.qty')} 1
              </span>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-50 p-1 ring-1 ring-slate-900/5 transition-colors group-hover:bg-white group-hover:shadow-sm">
                <motion.button
                  onClick={() =>
                    onUpdateQuantity(item.itemId, item.quantity - 1)
                  }
                  whileTap={{ scale: 0.85 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:text-[var(--brand-primary)]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </motion.button>
                <motion.span
                  key={item.quantity}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-7 w-8 items-center justify-center text-sm font-bold text-slate-900"
                >
                  {item.quantity}
                </motion.span>
                <motion.button
                  onClick={() =>
                    onUpdateQuantity(item.itemId, item.quantity + 1)
                  }
                  whileTap={{ scale: 0.85 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:text-[var(--brand-primary)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            )}

            {/* Line total */}
            <span className="text-lg font-black text-slate-900">
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>

        {/* Remove button */}
        <motion.button
          onClick={() => onRemove(item.itemId)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 opacity-0 shadow-sm ring-1 ring-slate-900/5 transition-all group-hover:opacity-100 hover:text-red-500 hover:ring-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
