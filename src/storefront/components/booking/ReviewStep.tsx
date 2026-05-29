import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  User,
  CalendarDays,
  Mail,
  IdCard,
  ClipboardList,
  Loader2,
  Check,
  Shield,
  CreditCard,
  Lock,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import type {
  BookableService,
  BookableProfessional,
} from '../../hooks/useBooking';
import type { BookingContactInput } from '@/utils/form-schemas';
import { BackButton } from './BackButton';
import { BrandButton } from './BrandButton';
import { ReviewRow } from './ReviewRow';
import { formatDateDisplay } from '@/utils/formatters';
import { fadeSlide, stepTransition } from './booking-utils';

interface ReviewStepProps {
  selectedService: BookableService | undefined;
  selectedProfessional: BookableProfessional | undefined;
  selectedDate: string;
  selectedSlot: string;
  contactValues: BookingContactInput;
  bookingError: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
  direction: number;
}

export function ReviewStep({
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedSlot,
  contactValues,
  bookingError,
  isSubmitting,
  onConfirm,
  onBack,
  direction,
}: ReviewStepProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  return (
    <motion.div
      key="review"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <BackButton onClick={onBack} label={t('storefront.booking.editInfo')} />
      <h2 className="text-xl font-bold text-foreground">
        {t('storefront.booking.reviewTitle')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          'storefront.booking.reviewHint',
          'Please confirm your appointment details',
        )}
      </p>

      <div className="mt-6 space-y-3">
        <ReviewRow
          icon={<Stethoscope className="h-4 w-4" />}
          label={t('storefront.booking.service')}
          value={selectedService?.name || ''}
          detail={[
            selectedService?.duration
              ? `${selectedService.duration} ${t('storefront.services.min')}`
              : '',
            selectedService?.price ? formatPrice(selectedService.price) : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        />
        <ReviewRow
          icon={<User className="h-4 w-4" />}
          label={t('storefront.booking.professional')}
          value={selectedProfessional?.name || ''}
        />
        <ReviewRow
          icon={<CalendarDays className="h-4 w-4" />}
          label={t('storefront.booking.dateTime')}
          value={`${formatDateDisplay(selectedDate)} · ${selectedSlot}`}
        />
        <ReviewRow
          icon={<Mail className="h-4 w-4" />}
          label={t('storefront.booking.contactInfo')}
          value={contactValues.name}
          detail={[contactValues.email, contactValues.phone]
            .filter(Boolean)
            .join(' · ')}
        />
        <ReviewRow
          icon={<IdCard className="h-4 w-4" />}
          label={t('storefront.booking.nationalId')}
          value={contactValues.nationalId}
        />
        {contactValues.notes && (
          <ReviewRow
            icon={<ClipboardList className="h-4 w-4" />}
            label={t('storefront.booking.reasonForVisit', 'Reason for Visit')}
            value={contactValues.notes}
          />
        )}
      </div>

      {/* Booking error banner */}
      {bookingError && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">{bookingError}</p>
        </div>
      )}

      {/* Payment Section — Pre-payment required */}
      {selectedService?.requiresPrepayment && selectedService.price ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              {t('storefront.booking.paymentSection', 'Payment')}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Invoice card */}
          <div
            className="overflow-hidden rounded-2xl border-2"
            style={{
              borderColor:
                'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
            }}
          >
            {/* Invoice header */}
            <div
              className="px-5 py-4"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 8%, transparent), color-mix(in srgb, var(--brand-secondary, var(--brand-primary)) 5%, transparent))',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                      color: 'var(--brand-primary)',
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t(
                        'storefront.booking.prepaymentNoticeTitle',
                        'Pre-payment required',
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t(
                        'storefront.booking.payBeforeConfirm',
                        'Pay to confirm your appointment',
                      )}
                    </p>
                  </div>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  {t('storefront.booking.invoiceLabel', 'Invoice')}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {selectedService.name}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatPrice(selectedService.price)}
                </span>
              </div>
              {selectedService.duration && (
                <p className="mt-1 ml-6 text-xs text-muted-foreground">
                  {selectedService.duration} {t('storefront.services.min')} ·{' '}
                  {formatDateDisplay(selectedDate)} · {selectedSlot}
                </p>
              )}

              {/* Total */}
              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                }}
              >
                <span className="text-sm font-bold text-foreground">
                  {t('storefront.cart.total')}
                </span>
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {formatPrice(selectedService.price)}
                </span>
              </div>
            </div>

            {/* Pay button */}
            <div
              className="border-t px-5 py-4 bg-muted/50"
              style={{
                borderColor:
                  'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
              }}
            >
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, var(--brand-primary)))',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('storefront.cart.processing')}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t('storefront.booking.payAndBook', 'Pay & Book')} —{' '}
                    {formatPrice(selectedService.price)}
                  </>
                )}
              </motion.button>

              {/* Trust signals */}
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {t('storefront.booking.securePayment', 'Secure SSL payment')}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {t('storefront.booking.poweredByStripe', 'Powered by Stripe')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Non-prepayment: simple total + confirm */}
          {selectedService?.price && (
            <div
              className="mt-6 flex items-center justify-between rounded-xl p-4"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
              }}
            >
              <span className="text-sm font-semibold text-foreground">
                {t('storefront.cart.total')}
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {formatPrice(selectedService.price)}
              </span>
            </div>
          )}

          <BrandButton
            onClick={onConfirm}
            disabled={isSubmitting}
            className="mt-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('storefront.cart.processing')}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('storefront.booking.confirmBooking')}
              </>
            )}
          </BrandButton>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            {t(
              'storefront.booking.dataProtected',
              'Your data is protected and encrypted',
            )}
          </p>
        </>
      )}
    </motion.div>
  );
}
