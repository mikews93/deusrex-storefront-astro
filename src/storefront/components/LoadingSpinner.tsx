export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-border"
        style={{ borderTopColor: 'var(--brand-primary)' }}
      />
    </div>
  );
}
