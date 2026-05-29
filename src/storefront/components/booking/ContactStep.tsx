import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  IdCard,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { BookingContactInput } from '@/utils/form-schemas';
import { BackButton } from './BackButton';
import { BrandButton } from './BrandButton';
import { FormField } from './FormField';
import { BookingSummaryBar } from './BookingSummaryBar';
import { fadeSlide, stepTransition } from './booking-utils';

interface ContactStepProps {
  register: UseFormRegister<BookingContactInput>;
  errors: FieldErrors<BookingContactInput>;
  isValid: boolean;
  selectedService:
    | {
        name: string;
        duration: number | null;
        price: string | null;
        requiresEncounter?: boolean;
      }
    | undefined;
  selectedProfessional: { name: string } | undefined;
  selectedDate: string;
  selectedSlot: string;
  onSubmit: () => void;
  onBack: () => void;
  direction: number;
}

export function ContactStep({
  register: reg,
  errors,
  isValid,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
  direction,
}: ContactStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="contact"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <BackButton onClick={onBack} label={t('storefront.booking.back')} />
      <h2 className="text-xl font-bold text-foreground">
        {t('storefront.booking.contactInfo')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          'storefront.booking.contactInfoHint',
          'We need your details to confirm the appointment',
        )}
      </p>

      <BookingSummaryBar
        service={selectedService}
        professional={selectedProfessional}
        date={selectedDate}
        time={selectedSlot}
      />

      <div className="mt-6 space-y-5">
        <FormField
          icon={<User className="h-4 w-4" />}
          label={`${t('storefront.booking.name')} *`}
          type="text"
          registration={reg('name')}
          error={errors.name?.message}
        />
        <FormField
          icon={<Mail className="h-4 w-4" />}
          label={`${t('storefront.booking.email')} *`}
          type="email"
          registration={reg('email')}
          error={errors.email?.message}
        />
        <FormField
          icon={<Phone className="h-4 w-4" />}
          label={t('storefront.booking.phone')}
          type="tel"
          registration={reg('phone')}
          error={errors.phone?.message}
        />
        <FormField
          icon={<IdCard className="h-4 w-4" />}
          label={`${t('storefront.booking.nationalId')} *`}
          type="text"
          registration={reg('nationalId')}
          placeholder={t('storefront.booking.nationalIdPlaceholder')}
          error={errors.nationalId?.message}
        />

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span className="text-muted-foreground">
              <ClipboardList className="h-4 w-4" />
            </span>
            {t(
              'storefront.booking.reasonForVisit',
              'Reason for Visit (optional)',
            )}
          </label>
          <textarea
            {...reg('notes')}
            rows={3}
            placeholder={t(
              'storefront.booking.reasonForVisitPlaceholder',
              'Briefly describe the reason for your consultation...',
            )}
            className="w-full rounded-xl border-2 border-border bg-muted/50 px-4 py-3 text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-transparent focus:bg-card focus:outline-none focus:ring-2 resize-none"
            style={
              {
                '--tw-ring-color': 'var(--brand-primary)',
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      <BrandButton onClick={onSubmit} disabled={!isValid} className="mt-8">
        {t('storefront.booking.reviewBooking')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </BrandButton>
    </motion.div>
  );
}
