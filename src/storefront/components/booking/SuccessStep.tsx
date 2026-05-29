import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Video,
  FileUp,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import type {
  BookableService,
  BookableProfessional,
  ServiceRequirementPublic,
} from '../../hooks/useBooking';
import { formatDateDisplay } from '@/utils/formatters';
import { fadeSlide } from './booking-utils';

interface SuccessStepProps {
  orgSlug: string;
  basePath: string;
  paymentStatus: 'success' | 'cancelled' | null;
  selectedService: BookableService | undefined;
  selectedProfessional: BookableProfessional | undefined;
  selectedDate: string;
  selectedSlot: string;
  direction: number;
  postRequirements?: ServiceRequirementPublic[];
}

const TYPE_ICONS: Record<string, typeof ShieldCheck> = {
  INFORMED_CONSENT: ShieldCheck,
  MEDIA: Video,
  DOCUMENT: FileUp,
};

export function SuccessStep({
  basePath,
  paymentStatus,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedSlot,
  direction,
  postRequirements = [],
}: SuccessStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="success"
      custom={direction}
      variants={fadeSlide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-10 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-xl shadow-primary/20 bg-(--brand-primary)"
      >
        <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mt-8 text-2xl font-bold text-foreground">
          {paymentStatus === 'success'
            ? t('storefront.booking.paymentConfirmed', 'Payment confirmed!')
            : t('storefront.booking.appointmentBooked')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          {paymentStatus === 'success'
            ? t(
                'storefront.booking.paymentConfirmationMessage',
                'Your payment was processed successfully and your appointment is now confirmed.',
              )
            : t('storefront.booking.confirmationMessage')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-auto mt-8 max-w-sm rounded-xl border border-border bg-card p-6 text-left"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('storefront.booking.service')}
            </span>
            <span className="font-medium text-foreground">
              {selectedService?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('storefront.booking.professional')}
            </span>
            <span className="font-medium text-foreground">
              {selectedProfessional?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('storefront.booking.dateTime')}
            </span>
            <span className="font-medium text-foreground">
              {formatDateDisplay(selectedDate)} · {selectedSlot}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Post-Service Requirements */}
      {postRequirements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-6 max-w-sm rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              {t(
                'storefront.booking.pendingRequirements',
                'Before Your Appointment',
              )}
            </h3>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            {t(
              'storefront.booking.pendingRequirementsHint',
              'Please complete the following before your visit:',
            )}
          </p>
          <ul className="space-y-2">
            {postRequirements.map((req) => {
              const Icon = TYPE_ICONS[req.requirementType] || ClipboardList;
              const url =
                req.requirementType === 'MEDIA'
                  ? ((req.config as Record<string, unknown>).url as string)
                  : null;

              return (
                <li key={req.id} className="flex items-start gap-2.5">
                  <Icon className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-amber-900">
                      {req.name}
                    </span>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-amber-700 underline mt-0.5 break-all"
                      >
                        {t('storefront.booking.viewMaterial', 'View {{type}}', {
                          type:
                            ((req.config as Record<string, unknown>)
                              .mediaType as string) || 'material',
                        })}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <a
          href={basePath || '/'}
          className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-lg bg-(--brand-primary)"
        >
          <Sparkles className="h-4 w-4" />
          {t('storefront.booking.backToStore')}
        </a>
      </motion.div>
    </motion.div>
  );
}
