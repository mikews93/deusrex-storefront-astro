import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { BookableProfessional } from '../../hooks/useBooking';
import { LoadingSpinner } from '../LoadingSpinner';
import { EmptyState } from '../EmptyState';
import { BackButton } from './BackButton';
import { fadeSlide, stepTransition } from './booking-utils';

interface ProfessionalStepProps {
  professionals: BookableProfessional[] | undefined;
  isLoading: boolean;
  selectedProfessionalId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  direction: number;
}

export function ProfessionalStep({ professionals, isLoading, selectedProfessionalId, onSelect, onBack, direction }: ProfessionalStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="professional"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <BackButton onClick={onBack} label={t('storefront.booking.back')} />
      <h2 className="text-xl font-bold text-foreground">
        {t('storefront.booking.selectProfessional')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('storefront.booking.selectProfessionalHint', 'Choose your preferred professional')}
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : professionals?.length === 0 ? (
        <EmptyState message={t('storefront.booking.noProfessionals')} />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {professionals?.map((pro) => {
            const isSelected = selectedProfessionalId === pro.id;
            return (
              <motion.button
                key={pro.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(pro.id)}
                className={`group flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                }`}
                style={isSelected ? {
                  borderColor: 'var(--brand-primary)',
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                } : undefined}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground transition-shadow ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-card' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    ...(isSelected ? { '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties : {}),
                  }}
                >
                  {pro.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{pro.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{pro.email}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
