interface ReviewRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}

export function ReviewRow({ icon, label, value, detail }: ReviewRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/50 p-4">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
          color: 'var(--brand-primary)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-semibold text-foreground">{value}</p>
        {detail && <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}
