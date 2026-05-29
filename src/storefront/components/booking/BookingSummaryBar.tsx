import { Stethoscope, User, CalendarDays } from 'lucide-react';
import { formatDateDisplay } from '@/utils/formatters';

interface BookingSummaryBarProps {
  service: { name: string; duration: number | null; price: string | null } | undefined;
  professional: { name: string } | undefined;
  date: string;
  time: string;
}

export function BookingSummaryBar({ service, professional, date, time }: BookingSummaryBarProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/80 px-4 py-3 text-xs text-muted-foreground">
      {service && (
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-medium text-foreground shadow-sm">
          <Stethoscope className="h-3 w-3" style={{ color: 'var(--brand-primary)' }} />
          {service.name}
        </span>
      )}
      {professional && (
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-medium text-foreground shadow-sm">
          <User className="h-3 w-3" style={{ color: 'var(--brand-primary)' }} />
          {professional.name}
        </span>
      )}
      <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-medium text-foreground shadow-sm">
        <CalendarDays className="h-3 w-3" style={{ color: 'var(--brand-primary)' }} />
        {formatDateDisplay(date)} · {time}
      </span>
    </div>
  );
}
