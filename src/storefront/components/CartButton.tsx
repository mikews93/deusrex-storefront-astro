import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';

interface CartButtonProps {
  orgSlug: string;
  onClick: () => void;
}

export function CartButton({ orgSlug, onClick }: CartButtonProps) {
  const { totalItems } = useCart(orgSlug);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onClick}
          className="sc-fab sc-fab--cart relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: 'var(--brand-primary, #0f172a)' }}
        >
          {/* Pulse ring on mount */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--brand-primary, #0f172a)' }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <ShoppingCart className="relative h-5 w-5" />
          <AnimatePresence mode="wait">
            <motion.span
              key={totalItems}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: 'var(--brand-secondary, var(--brand-primary, #10b981))' }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
