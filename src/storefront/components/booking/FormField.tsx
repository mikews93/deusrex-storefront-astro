interface FormFieldProps {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder?: string;
  error?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement> & { ref: React.Ref<HTMLInputElement> };
}

export function FormField({ icon, label, type, placeholder, error, registration }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:bg-card focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 bg-red-50/50 focus:border-transparent focus:ring-red-400'
            : 'border-border bg-muted/50 focus:border-transparent'
        }`}
        style={!error ? { '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties : undefined}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
