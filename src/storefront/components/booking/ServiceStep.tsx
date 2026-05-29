import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Stethoscope, Clock, ArrowRight, CreditCard } from 'lucide-react';
import { formatDuration } from '@/utils/formatters';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import type { BookableService } from '../../hooks/useBooking';
import { LoadingSpinner } from '../LoadingSpinner';
import { EmptyState } from '../EmptyState';
import { fadeSlide, stepTransition } from './booking-utils';

interface ServiceStepProps {
  services: BookableService[] | undefined;
  isLoading: boolean;
  selectedServiceId: string;
  onSelect: (id: string) => void;
  direction: number;
}

export function ServiceStep({
  services,
  isLoading,
  selectedServiceId,
  onSelect,
  direction,
}: ServiceStepProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  return (
    <motion.div
      key="service"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <h2 className="text-xl font-bold text-foreground">
        {t('storefront.booking.selectService')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          'storefront.booking.selectServiceHint',
          'Choose the service you need',
        )}
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : services?.length === 0 ? (
        <EmptyState message={t('storefront.booking.noServices')} />
      ) : (
        <div className="mt-6 grid gap-3">
          {services?.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <motion.button
                key={service.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(service.id)}
                className={`group relative flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: 'var(--brand-primary)',
                        backgroundColor:
                          'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                      }
                    : undefined
                }
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                    color: 'var(--brand-primary)',
                  }}
                >
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                  {service.requiresPrepayment && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      <CreditCard className="h-2.5 w-2.5" />
                      {t(
                        'storefront.booking.prepaymentRequired',
                        'Pre-payment',
                      )}
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {service.price && (
                    <p
                      className="whitespace-nowrap text-sm font-bold sm:text-base"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      {formatPrice(service.price)}
                    </p>
                  )}
                  {service.duration && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(service.duration)}
                    </p>
                  )}
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  style={
                    isSelected ? { color: 'var(--brand-primary)' } : undefined
                  }
                />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
