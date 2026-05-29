import {
  Stethoscope,
  User,
  CalendarDays,
  Mail,
  ClipboardCheck,
  Check,
} from 'lucide-react';

export type Step = 'service' | 'professional' | 'datetime' | 'contact' | 'review' | 'requirements' | 'success';

export const STEPS: Exclude<Step, 'success'>[] = [
  'service',
  'professional',
  'datetime',
  'contact',
  'review',
  'requirements',
];

export const stepMeta = {
  service: { icon: Stethoscope, label: 'storefront.booking.stepService' },
  professional: { icon: User, label: 'storefront.booking.stepProfessional' },
  datetime: { icon: CalendarDays, label: 'storefront.booking.stepDateTime' },
  contact: { icon: Mail, label: 'storefront.booking.stepContact' },
  review: { icon: Check, label: 'storefront.booking.stepReview' },
  requirements: { icon: ClipboardCheck, label: 'storefront.booking.stepRequirements' },
};

export const fadeSlide = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -60 : 60 }),
};

export const stepTransition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };
