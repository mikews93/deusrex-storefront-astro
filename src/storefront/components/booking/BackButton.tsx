import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label: string;
}

export function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
