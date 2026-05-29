import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarDays, Clock } from 'lucide-react';
import type { TimeSlot } from '../../hooks/useBooking';
import { LoadingSpinner } from '../LoadingSpinner';
import { EmptyState } from '../EmptyState';
import { BackButton } from './BackButton';
import { fadeSlide, stepTransition } from './booking-utils';

interface DateTimeStepProps {
  slots: TimeSlot[] | undefined;
  isLoadingSlots: boolean;
  selectedDate: string;
  selectedSlot: string;
  onDateSelect: (date: string) => void;
  onSlotSelect: (startTime: string) => void;
  onBack: () => void;
  direction: number;
  availableDays?: string[];
  isLoadingDays?: boolean;
}

/** Generate next 14 days for date selection */
function buildAvailableDates(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });
}

export function DateTimeStep({ slots, isLoadingSlots, selectedDate, selectedSlot, onDateSelect, onSlotSelect, onBack, direction, availableDays, isLoadingDays }: DateTimeStepProps) {
  const { t } = useTranslation();
  const allDates = buildAvailableDates();
  const availableSet = availableDays ? new Set(availableDays) : null;

  return (
    <motion.div
      key="datetime"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <BackButton onClick={onBack} label={t('storefront.booking.back')} />
      <h2 className="text-xl font-bold text-foreground">
        {t('storefront.booking.selectDateTime')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('storefront.booking.selectDateTimeHint', 'Pick a date and available time')}
      </p>

      {/* Date selector */}
      <div className="mt-6">
        <label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {t('storefront.booking.selectDate')}
        </label>
        {isLoadingDays ? (
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[76px] w-[72px] shrink-0 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {allDates.map((date) => {
              const d = new Date(date + 'T12:00:00');
              const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString(undefined, { month: 'short' });
              const isSelected = selectedDate === date;
              const isUnavailable = availableSet !== null && !availableSet.has(date);
              return (
                <motion.button
                  key={date}
                  whileHover={isUnavailable ? undefined : { y: -2 }}
                  whileTap={isUnavailable ? undefined : { scale: 0.95 }}
                  onClick={() => !isUnavailable && onDateSelect(date)}
                  disabled={isUnavailable}
                  className={`flex shrink-0 flex-col items-center rounded-xl border-2 px-4 py-3 text-center transition-all ${
                    isUnavailable
                      ? 'cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground/40'
                      : isSelected
                        ? 'text-primary-foreground shadow-lg'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:shadow-sm'
                  }`}
                  style={isSelected && !isUnavailable ? {
                    borderColor: 'var(--brand-primary)',
                    backgroundColor: 'var(--brand-primary)',
                  } : undefined}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{dayName}</span>
                  <span className="text-xl font-bold leading-tight">{dayNum}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-70">{month}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {t('storefront.booking.availableSlots')}
          </label>
          {isLoadingSlots ? (
            <LoadingSpinner />
          ) : slots?.length === 0 ? (
            <EmptyState message={t('storefront.booking.noSlots')} />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {slots?.map((slot) => {
                const isSelected = selectedSlot === slot.startTime;
                return (
                  <motion.button
                    key={slot.startTime}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSlotSelect(slot.startTime)}
                    className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all ${
                      isSelected
                        ? 'text-primary-foreground shadow-md'
                        : 'border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm'
                    }`}
                    style={isSelected ? {
                      borderColor: 'var(--brand-primary)',
                      backgroundColor: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, var(--brand-primary)))',
                    } : undefined}
                  >
                    {slot.startTime}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
