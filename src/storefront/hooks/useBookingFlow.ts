import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bookingContactSchema,
  type BookingContactInput,
} from '@/utils/form-schemas';
import { useStorefront } from './useStorefront';
import {
  useBookingServices,
  useBookingProfessionals,
  useBookingAvailability,
  useBookingAvailableDays,
  useCreateBooking,
  useServiceRequirements,
} from './useBooking';

export type BookingSection =
  | 'service'
  | 'professional'
  | 'datetime'
  | 'contact'
  | 'requirements'
  | 'review';

const SECTION_ORDER: BookingSection[] = [
  'service',
  'professional',
  'datetime',
  'contact',
  'requirements',
  'review',
];

const BOOKING_STORAGE_KEY = 'booking-pending-payment';

export function useBookingFlow({
  serviceId: preselectedServiceId,
}: { serviceId?: string } = {}) {
  const { basePath, orgSlug } = useStorefront();
  const { t } = useTranslation();

  /** State */
  const [activeSection, setActiveSection] = useState<BookingSection>('service');
  const [paymentStatus, setPaymentStatus] = useState<
    'success' | 'cancelled' | null
  >(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || '',
  );
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [requirementsCompleted, setRequirementsCompleted] = useState(false);

  /** API hooks */
  const { data: services, isLoading: loadingServices } = useBookingServices(
    orgSlug!,
  );
  const { data: professionals, isLoading: loadingProfessionals } =
    useBookingProfessionals(orgSlug!);
  const { data: slots, isLoading: loadingSlots } = useBookingAvailability(
    orgSlug!,
    selectedProfessionalId,
    selectedDate,
    selectedServiceId,
  );
  const { data: availableDays, isLoading: loadingDays } =
    useBookingAvailableDays(orgSlug!, selectedProfessionalId);
  const createBooking = useCreateBooking(orgSlug!);
  const { data: serviceRequirements = [] } = useServiceRequirements(
    orgSlug!,
    selectedServiceId,
  );

  /** Form */
  const form = useForm<BookingContactInput>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      notes: '',
    },
    mode: 'onChange',
  });
  const contactValues = form.watch();
  const { isValid: isFormValid } = form.formState;

  /** Derived */
  const selectedService = services?.find((s) => s.id === selectedServiceId);
  const selectedProfessional = professionals?.find(
    (p) => p.id === selectedProfessionalId,
  );
  const hasMandatoryPreRequirements = serviceRequirements.some(
    (r) => r.phase === 'PRE' && r.isMandatory,
  );

  /** Section status */
  const getSectionStatus = useCallback(
    (section: BookingSection): 'locked' | 'active' | 'completed' => {
      if (isSuccess) return 'completed';
      if (section === activeSection) return 'active';

      const sectionIndex = SECTION_ORDER.indexOf(section);
      const activeIndex = SECTION_ORDER.indexOf(activeSection);

      if (sectionIndex < activeIndex) return 'completed';
      return 'locked';
    },
    [activeSection, isSuccess],
  );

  const isSectionVisible = useCallback(
    (section: BookingSection): boolean => {
      if (section === 'service' && preselectedServiceId && selectedServiceId)
        return false;
      if (section === 'requirements' && !hasMandatoryPreRequirements)
        return false;
      return true;
    },
    [preselectedServiceId, selectedServiceId, hasMandatoryPreRequirements],
  );

  /** Effects — preselected service */
  useEffect(() => {
    if (
      preselectedServiceId &&
      services?.some((s) => s.id === preselectedServiceId)
    ) {
      setSelectedServiceId(preselectedServiceId);
      setActiveSection('professional');
    }
  }, [preselectedServiceId, services]);

  /** Effects — payment return (read from the URL; no router) */
  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get('payment');
    if (payment === 'success' || payment === 'cancelled') {
      const stored = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      if (stored) {
        const ctx = JSON.parse(stored) as {
          serviceId: string;
          professionalId: string;
          date: string;
          slot: string;
        };
        setSelectedServiceId(ctx.serviceId);
        setSelectedProfessionalId(ctx.professionalId);
        setSelectedDate(ctx.date);
        setSelectedSlot(ctx.slot);
        sessionStorage.removeItem(BOOKING_STORAGE_KEY);
      }

      if (payment === 'success') {
        setPaymentStatus('success');
        setIsSuccess(true);
      } else {
        setPaymentStatus('cancelled');
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Handlers */
  const selectService = useCallback((id: string) => {
    setSelectedServiceId(id);
    setSelectedProfessionalId('');
    setSelectedDate('');
    setSelectedSlot('');
    setRequirementsCompleted(false);
    setActiveSection('professional');
  }, []);

  const selectProfessional = useCallback((id: string) => {
    setSelectedProfessionalId(id);
    setSelectedDate('');
    setSelectedSlot('');
    setActiveSection('datetime');
  }, []);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
  }, []);

  const selectSlot = useCallback((startTime: string) => {
    setSelectedSlot(startTime);
    setActiveSection('contact');
  }, []);

  const submitContact = form.handleSubmit(() => {
    if (hasMandatoryPreRequirements) {
      setActiveSection('requirements');
    } else {
      setActiveSection('review');
    }
  });

  const completeRequirements = useCallback(() => {
    setRequirementsCompleted(true);
    setActiveSection('review');
  }, []);

  const editSection = useCallback((section: BookingSection) => {
    setActiveSection(section);
  }, []);

  const confirmBooking = useCallback(async () => {
    setBookingError(null);
    try {
      const payload: Record<string, unknown> = {
        name: contactValues.name.trim(),
        email: contactValues.email.trim(),
        phone: contactValues.phone?.trim() || '',
        nationalId: contactValues.nationalId.trim(),
        serviceId: selectedServiceId,
        professionalId: selectedProfessionalId,
        date: selectedDate,
        startTime: selectedSlot,
        successUrl: `${window.location.origin}${basePath}/book?payment=success`,
        cancelUrl: `${window.location.origin}${basePath}/book?payment=cancelled`,
        notes: contactValues.notes?.trim() || undefined,
      };

      /** On-behalf booking: include patient + requester relationship data */
      if (contactValues.isOnBehalf) {
        payload.isOnBehalf = true;
        payload.patientFirstName = contactValues.patientFirstName?.trim();
        payload.patientLastName = contactValues.patientLastName?.trim();
        payload.patientNationalId = contactValues.patientNationalId?.trim();
        payload.patientDateOfBirth =
          contactValues.patientDateOfBirth || undefined;
        payload.requesterRelationship = contactValues.requesterRelationship;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createBooking.mutateAsync(payload as any);

      if (result.requiresPayment) {
        if (result.checkoutUrl) {
          sessionStorage.setItem(
            BOOKING_STORAGE_KEY,
            JSON.stringify({
              serviceId: selectedServiceId,
              professionalId: selectedProfessionalId,
              date: selectedDate,
              slot: selectedSlot,
            }),
          );
          window.location.href = result.checkoutUrl;
        } else {
          setPaymentStatus('cancelled');
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setBookingError(
        t(
          'storefront.booking.bookingFailed',
          'Something went wrong. Please try again.',
        ),
      );
    }
  }, [
    contactValues,
    selectedServiceId,
    selectedProfessionalId,
    selectedDate,
    selectedSlot,
    basePath,
    createBooking,
    t,
  ]);

  return {
    orgSlug: orgSlug!,
    basePath,

    // Section management
    activeSection,
    isSuccess,
    getSectionStatus,
    isSectionVisible,
    editSection,

    // Selections
    selectedServiceId,
    selectedProfessionalId,
    selectedDate,
    selectedSlot,
    selectedService,
    selectedProfessional,

    // Data
    services,
    professionals,
    slots,
    availableDays,
    serviceRequirements,
    hasMandatoryPreRequirements,
    requirementsCompleted,
    setRequirementsCompleted,

    // Loading
    loadingServices,
    loadingProfessionals,
    loadingSlots,
    loadingDays,

    // Form
    form,
    contactValues,
    isFormValid,

    // Status
    paymentStatus,
    bookingError,
    isSubmitting: createBooking.isPending,

    // Actions
    selectService,
    selectProfessional,
    selectDate,
    selectSlot,
    submitContact,
    completeRequirements,
    confirmBooking,
  };
}
