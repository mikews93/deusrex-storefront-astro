import { useRef, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingSectionProps {
  stepNumber: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
  summary?: string;
  onEdit?: () => void;
  children: ReactNode;
}

export function BookingSection({
  stepNumber,
  title,
  status,
  summary,
  onEdit,
  children,
}: BookingSectionProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  /** Effects */
  useEffect(() => {
    if (status === 'active' && ref.current) {
      // Small delay to let the DOM settle before scrolling
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <div
      ref={ref}
      className={`scroll-mt-24 rounded-xl border transition-all duration-300 ${
        isActive
          ? 'border-[var(--brand-primary)]/30 bg-card shadow-lg shadow-black/5'
          : isCompleted
            ? 'border-border bg-card/50'
            : 'border-border/50 bg-muted/30 opacity-50'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-5 py-4 ${isCompleted && onEdit ? 'cursor-pointer hover:bg-muted/50' : ''}`}
        onClick={isCompleted && onEdit ? onEdit : undefined}
      >
        {/* Step badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700'
              : isActive
                ? 'text-white'
                : 'bg-muted text-muted-foreground'
          }`}
          style={
            isActive ? { backgroundColor: 'var(--brand-primary)' } : undefined
          }
        >
          {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
        </div>

        {/* Title + summary */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold ${isLocked ? 'text-muted-foreground' : ''}`}
          >
            {title}
          </h3>
          {isCompleted && summary && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {summary}
            </p>
          )}
        </div>

        {/* Edit button */}
        {isCompleted && onEdit && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
            {t('storefront.booking.edit', 'Edit')}
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
