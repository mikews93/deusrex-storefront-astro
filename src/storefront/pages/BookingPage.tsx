import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  FileText,
  PlayCircle,
  Download,
  Stethoscope,
} from 'lucide-react';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { RequirementsStep } from '../components/booking/RequirementsStep';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { formatDuration } from '@/utils/formatters';
import type {
  BookableProfessional,
  BookableService,
} from '../hooks/useBooking';

export default function BookingPage({
  serviceId,
}: { serviceId?: string } = {}) {
  const { t } = useTranslation();
  const flow = useBookingFlow({ serviceId });

  // Published site: `/book` (no serviceId) shows the service-selection step;
  // `/book/{id}` preselects it. No redirect — the flow handles both.
  if (!flow.orgSlug) return null;

  /** Success state */
  if (flow.isSuccess) {
    return <SuccessView flow={flow} />;
  }

  const availableSet = flow.availableDays ? new Set(flow.availableDays) : null;

  return (
    <div className="min-h-screen bg-(--brand-bg,#faf9f5) pb-24 text-(--brand-text,#0f172a) relative">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none fixed -right-[15%] -top-[15%] z-0 h-[800px] w-[800px] rounded-full mix-blend-multiply filter blur-[140px] opacity-10"
        style={{ backgroundColor: 'var(--brand-primary)' }}
        aria-hidden="true"
      />

      {/* Hero */}
      <header className="relative z-10 mx-auto max-w-7xl mb-16 pt-12 px-4 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-(--brand-text,#0f172a) sm:text-5xl lg:text-6xl">
          {t('storefront.booking.heroLine1', 'Start the journey')} <br />
          <span style={{ color: 'var(--brand-primary)' }}>
            {t('storefront.booking.heroLine2', 'to better care.')}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-(--brand-text-muted,#475569) leading-relaxed">
          {t(
            'storefront.booking.heroSubtitle',
            'Schedule a session with our specialists. A safe, warm, and professional space for your care.',
          )}
        </p>
      </header>

      {/* Payment cancelled recovery banner */}
      {flow.paymentStatus === 'cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-10 max-w-4xl px-4 sm:px-6 z-20 relative"
        >
          <div className="relative overflow-hidden rounded-(--brand-radius,1.5rem) border border-amber-500/20 bg-linear-to-br from-amber-500/10 to-transparent p-6 sm:p-8 shadow-[0_8px_30px_rgb(245,158,11,0.1)] backdrop-blur-xl">
            {/* Decorative ambient glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/20 blur-[50px] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 shadow-inner">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-(--brand-text,#0f172a) tracking-tight">
                    {t(
                      'storefront.booking.paymentCancelled',
                      'Payment Incomplete',
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-(--brand-text-muted,#475569) max-w-md">
                    {t(
                      'storefront.booking.paymentCancelledHint',
                      'Your booking process was interrupted. Review your summary below and try again to secure your spot.',
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                  })
                }
                className="shrink-0 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-amber-600"
              >
                {t('storefront.booking.retryPayment', 'Continue to Payment')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main grid — asymmetric editorial layout */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12">
        {/* Left column — selections & form */}
        <div className="space-y-8 lg:col-span-7">
          {/* Service Banner */}
          {flow.selectedService && (
            <ServiceBanner
              service={flow.selectedService}
              basePath={flow.basePath}
            />
          )}

          {/* Section 1: Specialist Selection */}
          <SpecialistSection
            professionals={flow.professionals ?? []}
            isLoading={flow.loadingProfessionals}
            selectedId={flow.selectedProfessionalId}
            onSelect={flow.selectProfessional}
          />

          {/* Section 2: Patient Details */}
          <PatientDetailsSection form={flow.form} />

          {/* Section 3: Requirements (shown upfront when service has pre-requirements) */}
          {flow.hasMandatoryPreRequirements && (
            <section className="rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white)/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 backdrop-blur-xl relative overflow-hidden z-10">
              <div className="flex items-center gap-4 mb-8">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-(--brand-primary)"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                  }}
                >
                  3
                </span>
                <h2 className="text-2xl font-extrabold text-(--brand-text,#0f172a)">
                  {t('storefront.booking.requirements', 'Requirements')}
                </h2>
              </div>
              <RequirementsStep
                requirements={flow.serviceRequirements}
                onCompletionChange={flow.setRequirementsCompleted}
              />
            </section>
          )}
        </div>

        {/* Right column — calendar & summary */}
        <div className="space-y-8 lg:col-span-5">
          {/* Date & Time (section 3 or 4 depending on requirements) */}
          <section className="rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white)/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-(--brand-primary)"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                }}
              >
                {flow.hasMandatoryPreRequirements ? 4 : 3}
              </span>
              <h2 className="text-2xl font-extrabold text-(--brand-text,#0f172a)">
                {t('storefront.booking.dateTime', 'Date & Time')}
              </h2>
            </div>

            {/* Calendar */}
            <InlineCalendar
              selectedDate={flow.selectedDate}
              onDateSelect={flow.selectDate}
              availableDays={availableSet}
              isLoading={flow.loadingDays}
              disabled={!flow.selectedProfessionalId}
            />

            {/* Time Slots */}
            {flow.selectedDate && (
              <div className="mt-8 space-y-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t('storefront.booking.availableTimes', 'Available Times')}
                </p>
                {flow.loadingSlots ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : flow.slots && flow.slots.length > 0 ? (
                  (() => {
                    // Trust the server: it returns the day's bookable slots.
                    // The previous client-side "today" filter compared slot
                    // times (in the org's TZ) against the viewer's browser
                    // clock, which hid every remaining slot for anyone whose
                    // browser was ahead of the org's TZ — so today's calendar
                    // looked empty even when slots existed. The booking
                    // endpoint rejects past slots server-side.
                    const availableSlots = flow.slots;

                    return availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected =
                            flow.selectedSlot === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              onClick={() => flow.selectSlot(slot.startTime)}
                              className={`rounded-lg border py-2 text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'border-(--brand-secondary,var(--brand-primary)) font-bold'
                                  : 'border-border/30 bg-card hover:border-(--brand-secondary,var(--brand-primary))'
                              }`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor:
                                        'color-mix(in srgb, var(--brand-secondary, var(--brand-primary)) 15%, transparent)',
                                      color:
                                        'var(--brand-secondary, var(--brand-primary))',
                                    }
                                  : undefined
                              }
                            >
                              {slot.startTime}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        {t(
                          'storefront.booking.noSlots',
                          'No available times for this date.',
                        )}
                      </p>
                    );
                  })()
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t(
                      'storefront.booking.noSlots',
                      'No available times for this date.',
                    )}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Section 5 (or 4 without requirements): Summary & Confirm */}
          <section className="rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white)/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 backdrop-blur-xl z-10">
            <div className="flex items-center gap-4 mb-8">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-(--brand-primary)"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                }}
              >
                {flow.hasMandatoryPreRequirements ? 5 : 4}
              </span>
              <h2 className="text-2xl font-extrabold text-(--brand-text,#0f172a)">
                {t('storefront.booking.summary', 'Summary')}
              </h2>
            </div>
            <SummaryAndConfirm flow={flow} />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Service Banner — shows which service is being booked
 * ────────────────────────────────────────────────────────── */

function ServiceBanner({
  service,
  basePath,
}: {
  service: BookableService;
  basePath: string;
}) {
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  return (
    <div className="flex items-center justify-between rounded-2xl bg-(--brand-surface,white)/70 px-6 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-900/5 backdrop-blur-xl relative z-10">
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            color: 'var(--brand-primary)',
          }}
        >
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold text-(--brand-text,#0f172a)">
            {service.name}
          </p>
          <div className="flex items-center gap-3 text-sm text-(--brand-text-muted,#64748b)">
            {service.duration && (
              <span>{formatDuration(service.duration)}</span>
            )}
            {service.duration && service.price && (
              <span className="text-slate-300">·</span>
            )}
            {service.price && (
              <span
                className="font-semibold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {formatPrice(service.price)}
              </span>
            )}
          </div>
        </div>
      </div>
      <a
        href={`${basePath}/services`}
        className="text-sm font-semibold transition-colors hover:opacity-80"
        style={{ color: 'var(--brand-primary)' }}
      >
        {t('storefront.booking.changeService', 'Change')}
      </a>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Specialist Selection Section
 * ────────────────────────────────────────────────────────── */

function SpecialistSection({
  professionals,
  isLoading,
  selectedId,
  onSelect,
}: {
  professionals: BookableProfessional[];
  isLoading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white)/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 backdrop-blur-xl relative overflow-hidden z-10">
      {/* Decorative blob */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-(--brand-primary)"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
            }}
          >
            1
          </span>
          <h2 className="text-2xl font-extrabold text-(--brand-text,#0f172a)">
            {t(
              'storefront.booking.selectProfessional',
              'Choose Your Specialist',
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {professionals.map((prof) => {
              const isSelected = prof.id === selectedId;
              return (
                <button
                  key={prof.id}
                  onClick={() => onSelect(prof.id)}
                  className={`flex items-center gap-4 rounded-2xl border bg-(--brand-surface,white) p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                    isSelected
                      ? 'border-(--brand-primary) shadow-[0_8px_24px_color-mix(in_srgb,var(--brand-primary)_15%,transparent)] ring-1 ring-(--brand-primary)'
                      : 'border-slate-100 hover:border-(--brand-primary)'
                  }`}
                >
                  <ProfessionalAvatar prof={prof} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{prof.name}</p>
                    {prof.specialization && (
                      <p className="text-sm text-muted-foreground">
                        {prof.specialization}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0"
                      style={{
                        color: 'var(--brand-secondary, var(--brand-primary))',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function ProfessionalAvatar({ prof }: { prof: BookableProfessional }) {
  if (prof.imageUrl) {
    return (
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
        <img
          src={prof.imageUrl}
          alt={prof.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initials = prof.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
      style={{ backgroundColor: 'var(--brand-primary)' }}
    >
      {initials}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Patient Details Section
 * ────────────────────────────────────────────────────────── */

function PatientDetailsSection({
  form,
}: {
  form: ReturnType<typeof useBookingFlow>['form'];
}) {
  const { t } = useTranslation();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const isOnBehalf = watch('isOnBehalf');

  const inputCls =
    'w-full rounded-2xl border border-slate-100 bg-(--brand-bg,#faf9f5) px-5 py-4 text-sm transition-all placeholder:text-slate-400 focus:bg-(--brand-surface,white) focus:ring-2 focus:ring-offset-2 focus:ring-(--brand-secondary,var(--brand-primary))';

  /** Relationship options for the select dropdown */
  const relationshipOptions: { value: string; label: string }[] = [
    { value: 'PADRE', label: t('patients.relationships.PADRE', 'Father') },
    { value: 'MADRE', label: t('patients.relationships.MADRE', 'Mother') },
    {
      value: 'ABUELO',
      label: t('patients.relationships.ABUELO', 'Grandfather'),
    },
    {
      value: 'ABUELA',
      label: t('patients.relationships.ABUELA', 'Grandmother'),
    },
    {
      value: 'TUTOR',
      label: t('patients.relationships.TUTOR', 'Legal Guardian'),
    },
    { value: 'CONYUGE', label: t('patients.relationships.CONYUGE', 'Spouse') },
    { value: 'HERMANO', label: t('patients.relationships.HERMANO', 'Brother') },
    { value: 'HERMANA', label: t('patients.relationships.HERMANA', 'Sister') },
    { value: 'TIO', label: t('patients.relationships.TIO', 'Uncle') },
    { value: 'TIA', label: t('patients.relationships.TIA', 'Aunt') },
    {
      value: 'PERSONA_DE_APOYO',
      label: t('patients.relationships.PERSONA_DE_APOYO', 'Caregiver'),
    },
    { value: 'OTRO', label: t('patients.relationships.OTRO', 'Other') },
  ];

  return (
    <section className="rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white)/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 backdrop-blur-xl relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-(--brand-primary)"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
          }}
        >
          2
        </span>
        <h2 className="text-2xl font-extrabold text-(--brand-text,#0f172a)">
          {t('storefront.booking.patientDetails', 'Your Details')}
        </h2>
      </div>

      {/* On-behalf toggle */}
      <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <input
          type="checkbox"
          checked={isOnBehalf}
          onChange={(e) =>
            setValue('isOnBehalf', e.target.checked, { shouldValidate: true })
          }
          className="h-4 w-4 rounded accent-(--brand-primary)"
        />
        <span className="text-sm font-medium text-slate-700">
          {t(
            'storefront.booking.isOnBehalf',
            'This appointment is for someone else',
          )}
        </span>
      </label>

      {/* Patient fields — shown when booking on behalf */}
      {isOnBehalf && (
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--brand-text-muted,#64748b)">
            {t('storefront.booking.patientSectionTitle', 'Patient Information')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-muted-foreground">
                {t('storefront.booking.patientFirstName', 'First Name')} *
              </label>
              <input
                {...register('patientFirstName')}
                placeholder={t(
                  'storefront.booking.patientFirstNamePlaceholder',
                  'e.g. María',
                )}
                className={inputCls}
              />
              {errors.patientFirstName && (
                <p className="ml-1 text-xs text-destructive">
                  {errors.patientFirstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-muted-foreground">
                {t('storefront.booking.patientLastName', 'Last Name')} *
              </label>
              <input
                {...register('patientLastName')}
                placeholder={t(
                  'storefront.booking.patientLastNamePlaceholder',
                  'e.g. García',
                )}
                className={inputCls}
              />
              {errors.patientLastName && (
                <p className="ml-1 text-xs text-destructive">
                  {errors.patientLastName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-muted-foreground">
                {t('storefront.booking.patientId', 'Patient ID')} *
              </label>
              <input
                {...register('patientNationalId')}
                placeholder={t(
                  'storefront.booking.idPlaceholder',
                  'e.g. 12345678',
                )}
                className={inputCls}
              />
              {errors.patientNationalId && (
                <p className="ml-1 text-xs text-destructive">
                  {errors.patientNationalId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-muted-foreground">
                {t('storefront.booking.patientDob', 'Date of Birth')}
              </label>
              <input
                {...register('patientDateOfBirth')}
                type="date"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Requester / Contact fields */}
      {isOnBehalf && (
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--brand-text-muted,#64748b)">
          {t(
            'storefront.booking.requesterSectionTitle',
            'Your Contact Information',
          )}
        </h3>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="ml-1 text-sm font-semibold text-muted-foreground">
            {t('storefront.booking.nameLabel', 'Full Name')}
          </label>
          <input
            {...register('name')}
            placeholder={t(
              'storefront.booking.namePlaceholder',
              'e.g. John Doe',
            )}
            className={inputCls}
          />
          {errors.name && (
            <p className="ml-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {!isOnBehalf && (
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-muted-foreground">
              {t('storefront.booking.idLabel', 'National ID')}
            </label>
            <input
              {...register('nationalId')}
              placeholder={t(
                'storefront.booking.idPlaceholder',
                'e.g. 12345678',
              )}
              className={inputCls}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="ml-1 text-sm font-semibold text-muted-foreground">
            {t('storefront.booking.emailLabel', 'Email')}
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="hello@example.com"
            className={inputCls}
          />
          {errors.email && (
            <p className="ml-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-sm font-semibold text-muted-foreground">
            {t('storefront.booking.phoneLabel', 'Phone')}
          </label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+1 ..."
            className={inputCls}
          />
        </div>

        {/* Relationship — only when on behalf */}
        {isOnBehalf && (
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-muted-foreground">
              {t('storefront.booking.relationship', 'Relationship to Patient')}{' '}
              *
            </label>
            <select {...register('requesterRelationship')} className={inputCls}>
              <option value="">
                {t('storefront.booking.selectRelationship', 'Select...')}
              </option>
              {relationshipOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.requesterRelationship && (
              <p className="ml-1 text-xs text-destructive">
                {errors.requesterRelationship.message}
              </p>
            )}
          </div>
        )}

        {/* Notes — always visible */}
        <div className="space-y-2 md:col-span-2">
          <label className="ml-1 text-sm font-semibold text-muted-foreground">
            {t('storefront.booking.notesLabel', 'Reason for visit (Optional)')}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder={t(
              'storefront.booking.notesPlaceholder',
              'Tell us briefly about the reason for your visit...',
            )}
            className={inputCls}
          />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
 * Inline Month Calendar
 * ────────────────────────────────────────────────────────── */

function InlineCalendar({
  selectedDate,
  onDateSelect,
  availableDays,
  isLoading,
  disabled,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays: Set<string> | null;
  isLoading: boolean;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const initial = selectedDate ? new Date(selectedDate + 'T12:00:00') : today;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const dayNames = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 12 : viewMonth;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      day: d,
      inMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, inMonth: true, dateStr });
  }

  const goBack = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else setViewMonth(viewMonth - 1);
  };
  const goForward = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else setViewMonth(viewMonth + 1);
  };

  if (disabled) {
    return (
      <div className="rounded-(--brand-radius,1.5rem) bg-card p-6 shadow-sm opacity-50">
        <p className="text-center text-sm text-muted-foreground py-8">
          {t(
            'storefront.booking.selectSpecialistFirst',
            'Select a specialist to view available dates.',
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-(--brand-radius,1.5rem) bg-card p-6 shadow-sm">
      {/* Month nav */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold">
          {monthNames[viewMonth]} {viewYear}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="rounded-full p-2 hover:bg-muted"
            style={{ color: 'var(--brand-primary)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goForward}
            className="rounded-full p-2 hover:bg-muted"
            style={{ color: 'var(--brand-primary)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-[10px] uppercase font-bold text-muted-foreground">
        {dayNames.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Day cells */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2 text-center">
          {cells.map((cell, i) => {
            if (!cell.inMonth) {
              return (
                <span key={i} className="p-2 text-sm text-muted-foreground/40">
                  {cell.day}
                </span>
              );
            }

            const isPast = cell.dateStr < todayStr;
            const isAvailable = availableDays
              ? availableDays.has(cell.dateStr)
              : !isPast;
            const isSelected = cell.dateStr === selectedDate;
            if (isPast || !isAvailable) {
              return (
                <span key={i} className="p-2 text-sm text-muted-foreground/40">
                  {cell.day}
                </span>
              );
            }

            return (
              <button
                key={i}
                onClick={() => onDateSelect(cell.dateStr)}
                className={`rounded-lg p-2 text-sm transition-all ${
                  isSelected
                    ? 'font-bold text-white'
                    : 'hover:bg-slate-100 cursor-pointer'
                }`}
                style={
                  isSelected
                    ? { backgroundColor: 'var(--brand-primary)' }
                    : undefined
                }
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Summary & Confirm
 * ────────────────────────────────────────────────────────── */

function SummaryAndConfirm({
  flow,
}: {
  flow: ReturnType<typeof useBookingFlow>;
}) {
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  const canConfirm =
    flow.selectedServiceId &&
    flow.selectedProfessionalId &&
    flow.selectedDate &&
    flow.selectedSlot &&
    flow.isFormValid &&
    (!flow.hasMandatoryPreRequirements || flow.requirementsCompleted);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div>
      {flow.selectedDate && flow.selectedSlot && (
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t(
                'storefront.booking.appointmentSummary',
                'Appointment Summary',
              )}
            </p>
            <p className="text-xl font-bold">
              {formatDateDisplay(flow.selectedDate)} &mdash; {flow.selectedSlot}
            </p>
          </div>
          {flow.selectedService?.price && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {t('storefront.booking.investment', 'Investment')}
              </p>
              <p
                className="text-2xl font-black"
                style={{
                  color: 'var(--brand-secondary, var(--brand-primary))',
                }}
              >
                {formatPrice(flow.selectedService.price)}
              </p>
            </div>
          )}
        </div>
      )}

      {flow.bookingError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {flow.bookingError}
        </div>
      )}

      <button
        onClick={flow.confirmBooking}
        disabled={!canConfirm || flow.isSubmitting}
        className={`flex w-full items-center justify-center gap-3 rounded-full py-4 text-base font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:shadow-none ${
          canConfirm ? 'text-white' : 'bg-slate-100 text-slate-400'
        }`}
        style={{
          background: canConfirm
            ? 'linear-gradient(to right, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 70%, transparent))'
            : undefined,
        }}
      >
        {flow.isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {t('storefront.booking.confirmAppointment', 'Confirm Appointment')}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t(
          'storefront.booking.termsNotice',
          'By confirming, you accept our cancellation and privacy policies.',
        )}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Success View
 * ────────────────────────────────────────────────────────── */

function SuccessView({ flow }: { flow: ReturnType<typeof useBookingFlow> }) {
  const { t } = useTranslation();
  const vaultRef = useRef<HTMLDivElement>(null);

  const postRequirements = flow.serviceRequirements.filter(
    (r) => r.phase === 'POST',
  );

  useEffect(() => {
    if (postRequirements.length > 0 && vaultRef.current) {
      const timer = setTimeout(() => {
        vaultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [postRequirements.length]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-12">
        {/* Main Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-4xl border-0 bg-(--brand-surface,white) shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5"
        >
          <div
            className="absolute left-0 top-0 h-2 w-full"
            style={{
              background:
                'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary, var(--brand-primary)))',
            }}
          />
          <div className="flex flex-col items-center p-6 text-center sm:p-10 md:p-16">
            <div
              className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full shadow-inner"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
              }}
            >
              <CheckCircle2
                className="h-10 w-10 sm:h-12 sm:w-12"
                style={{ color: 'var(--brand-primary)' }}
              />
            </div>
            <h1 className="mt-8 text-3xl sm:text-4xl font-black tracking-tight text-(--brand-text,#0f172a)">
              {flow.paymentStatus === 'success'
                ? t('storefront.booking.paymentSuccess', 'Payment Confirmed!')
                : t('storefront.booking.bookingSuccess', 'Appointment Booked!')}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-(--brand-text-muted,#475569)">
              {t(
                'storefront.booking.successMessage',
                "Your appointment has been secured. We've sent a detailed confirmation email to your inbox.",
              )}
            </p>

            {flow.selectedService && (
              <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl bg-(--brand-bg,#faf9f5) px-8 py-6 ring-1 ring-slate-900/5">
                <p className="text-lg font-bold text-(--brand-text,#0f172a)">
                  {flow.selectedService.name}
                </p>
                {flow.selectedProfessional && (
                  <p className="text-sm font-medium text-(--brand-text-muted,#64748b)">
                    with {flow.selectedProfessional.name}
                  </p>
                )}
                <div
                  className="mt-2 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                    color: 'var(--brand-primary)',
                  }}
                >
                  {flow.selectedDate} • {flow.selectedSlot}
                </div>
              </div>
            )}

            <a
              href={`${flow.basePath}/services`}
              className="mt-10 inline-flex h-14 items-center justify-center rounded-xl px-10 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {t('storefront.booking.backToServices', 'Back to Services')}
            </a>
          </div>
        </motion.div>

        {/* The "Unlock Vault" - Post Requirements Section */}
        {postRequirements.length > 0 && (
          <motion.div
            ref={vaultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="scroll-mt-8"
          >
            <div className="mb-8 flex items-end justify-between px-2">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-(--brand-text,#0f172a)">
                  {t('storefront.booking.postRequirements', 'Your Materials')}
                </h2>
                <p className="mt-2 text-base text-(--brand-text-muted,#64748b)">
                  Please review these required files before your appointment.
                </p>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-2 px-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {postRequirements.map((r) => {
                const cfg = (r.config || {}) as Record<string, unknown>;
                const docUrl = (cfg.documentUrl ||
                  cfg.referenceDocumentUrl ||
                  cfg.url) as string | undefined;

                const isVideo = r.requirementType === 'MEDIA';

                return (
                  <a
                    key={r.id}
                    href={docUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-(--brand-radius,1.5rem) bg-(--brand-surface,white) shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
                  >
                    {/* Visual Top Half */}
                    <div
                      className="relative flex h-40 w-full items-center justify-center overflow-hidden transition-colors duration-500"
                      style={{
                        backgroundColor: isVideo
                          ? 'slate-900'
                          : 'color-mix(in srgb, var(--brand-primary) 5%, transparent)',
                      }}
                    >
                      {isVideo ? (
                        <>
                          <div className="absolute inset-0 bg-slate-900 opacity-90 transition-opacity group-hover:opacity-80" />
                          <PlayCircle className="absolute z-10 h-16 w-16 text-white opacity-80 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100" />
                        </>
                      ) : (
                        <FileText
                          className="h-16 w-16 transition-transform duration-300 group-hover:scale-110"
                          style={{ color: 'var(--brand-primary)' }}
                        />
                      )}
                    </div>

                    {/* Info Bottom Half */}
                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {r.requirementType}
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-lg font-bold text-(--brand-text,#0f172a) transition-colors group-hover:text-slate-700">
                        {r.name}
                      </h3>
                      {r.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-(--brand-text-muted,#64748b)">
                          {r.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-6">
                        <span className="text-sm font-medium text-(--brand-text-muted,#64748b)">
                          {isVideo ? 'Watch Video' : 'View Document'}
                        </span>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                          style={{
                            backgroundColor:
                              'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                            color: 'var(--brand-primary)',
                          }}
                        >
                          {isVideo ? (
                            <PlayCircle className="h-5 w-5" />
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
