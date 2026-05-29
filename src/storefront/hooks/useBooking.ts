import { useQuery, useMutation } from '@tanstack/react-query';
import { env } from '@/config/env';

const API_BASE = env.API_URL.replace('/trpc', '');

export interface BookableService {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  duration: number | null;
  imageUrl?: string | null;
  requiresPrepayment: boolean;
  requiresEncounter: boolean;
}

export interface BookableProfessional {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  specialization: string | null;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  serviceId: string;
  professionalId: string;
  date: string;
  startTime: string;
  successUrl?: string;
  cancelUrl?: string;
  notes?: string;
}

interface BookingResult {
  appointment: Record<string, unknown>;
  person: { name: string; email: string };
  requiresPayment: boolean;
  invoiceId?: string;
  checkoutUrl?: string | null;
}

export function useBookingServices(orgSlug: string) {
  return useQuery<BookableService[]>({
    queryKey: ['booking-services', orgSlug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/booking/${orgSlug}/services`);
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    },
    enabled: !!orgSlug,
  });
}

export function useBookingProfessionals(orgSlug: string) {
  return useQuery<BookableProfessional[]>({
    queryKey: ['booking-professionals', orgSlug],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/public/booking/${orgSlug}/professionals`,
      );
      if (!res.ok) throw new Error('Failed to fetch professionals');
      return res.json();
    },
    enabled: !!orgSlug,
  });
}

export function useBookingAvailability(
  orgSlug: string,
  professionalId: string,
  date: string,
  serviceId: string,
) {
  return useQuery<TimeSlot[]>({
    queryKey: [
      'booking-availability',
      orgSlug,
      professionalId,
      date,
      serviceId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        professionalId,
        date,
        serviceId,
      });
      const res = await fetch(
        `${API_BASE}/public/booking/${orgSlug}/availability?${params}`,
      );
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: !!orgSlug && !!professionalId && !!date && !!serviceId,
  });
}

export function useBookingAvailableDays(
  orgSlug: string,
  professionalId: string,
  days: number = 14,
) {
  return useQuery<string[]>({
    queryKey: ['booking-available-days', orgSlug, professionalId, days],
    queryFn: async () => {
      const params = new URLSearchParams({
        professionalId,
        days: String(days),
      });
      const res = await fetch(
        `${API_BASE}/public/booking/${orgSlug}/available-days?${params}`,
      );
      if (!res.ok) throw new Error('Failed to fetch available days');
      return res.json();
    },
    enabled: !!orgSlug && !!professionalId,
  });
}

export interface ServiceRequirementPublic {
  id: string;
  name: string;
  description: string | null;
  requirementType: 'INFORMED_CONSENT' | 'FORM' | 'DOCUMENT' | 'MEDIA';
  phase: 'PRE' | 'POST';
  isMandatory: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
}

export function useServiceRequirements(orgSlug: string, serviceId: string) {
  return useQuery<ServiceRequirementPublic[]>({
    queryKey: ['booking-service-requirements', orgSlug, serviceId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/public/booking/${orgSlug}/services/${serviceId}/requirements`,
      );
      if (!res.ok) throw new Error('Failed to fetch requirements');
      return res.json();
    },
    enabled: !!orgSlug && !!serviceId,
  });
}

export function useCreateBooking(orgSlug: string) {
  return useMutation({
    mutationFn: async (data: BookingPayload): Promise<BookingResult> => {
      const res = await fetch(`${API_BASE}/public/booking/${orgSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Booking failed');
      return res.json();
    },
  });
}
